import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use createRequire so we get the same CJS module.exports reference as user.js does
const require = createRequire(import.meta.url);
const db = require('../db');
const authSettings = require('../util/auth-settings');
const config = require('config');
const auditLogService = require('../services/audit-log');
const getUserMiddleware = require('./user.js');

const JWT_SECRET = config.auth.jwtSecret;

// Store originals for clean restoration
const originalUserFindOne = db.User.findOne;
const originalProjectFindOne = db.Project.findOne;
const originalApiTokenFindOne = db.ApiToken.findOne;
const originalAuditLogFindOne = db.AuditLog.findOne;
const originalLogDirect = auditLogService.logDirect;
const originalAuthSettingsConfig = authSettings.config;
const originalFixedAuthTokens = config.auth.fixedAuthTokens;

// The `config` module forbids direct assignment to its properties at runtime
// (immutable unless ALLOW_CONFIG_MUTATIONS is set), but the underlying property
// is `configurable`, so Object.defineProperty can override it for a test.
function setFixedAuthTokens(value) {
  Object.defineProperty(config.auth, 'fixedAuthTokens', {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

afterEach(() => {
  db.User.findOne = originalUserFindOne;
  db.Project.findOne = originalProjectFindOne;
  db.ApiToken.findOne = originalApiTokenFindOne;
  db.AuditLog.findOne = originalAuditLogFindOne;
  auditLogService.logDirect = originalLogDirect;
  authSettings.config = originalAuthSettingsConfig;
  // Restore fixedAuthTokens in case a test mutated the shared config singleton
  setFixedAuthTokens(originalFixedAuthTokens);
  vi.restoreAllMocks();
});

function createMockReq(overrides = {}) {
  return {
    headers: {},
    path: '/api/project/1/resource',
    project: { id: 2, config: {} },
    ...overrides,
  };
}

function createMockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn() };
}

describe('user middleware', () => {
  describe('no authorization header', () => {
    it('sets anonymous user and calls next', async () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('upload path with authorization header', () => {
    it('replaces authorization with upload-service JWT and proceeds', async () => {
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      db.User.findOne = vi.fn().mockResolvedValue(null);

      const req = createMockReq({
        headers: { authorization: 'some-token' },
        path: '/upload/images',
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      const authHeader = req.headers['authorization'];
      expect(authHeader).toMatch(/^Bearer /i);
      const token = authHeader.replace(/^Bearer /i, '');
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.userId).toBe('9999999');
      expect(decoded.authProvider).toBe('upload-service');
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('valid JWT token', () => {
    it('fetches user from db and attaches to req.user when idpUser is absent', async () => {
      const payload = { userId: 10, authProvider: 'openstad' };
      const token = jwt.sign(payload, JWT_SECRET);

      const fakeUser = { id: 10, role: 'member', projectId: 2, idpUser: null };
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      db.User.findOne = vi.fn().mockResolvedValue(fakeUser);

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      expect(req.user).toBe(fakeUser);
      expect(next).toHaveBeenCalledWith();
    });

    it('sets anonymous when JWT has no userId field', async () => {
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      const token = jwt.sign({ someOtherField: 'value' }, JWT_SECRET);

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(next).toHaveBeenCalledWith();
    });

    it('calls next with a TokenExpiredError on an expired JWT', async () => {
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      // exp in the past => jsonwebtoken throws TokenExpiredError on verify
      const token = jwt.sign(
        {
          userId: 10,
          authProvider: 'openstad',
          exp: Math.floor(Date.now() / 1000) - 60,
        },
        JWT_SECRET
      );

      const req = createMockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('TokenExpiredError');
      expect(req.user).toBeUndefined();
    });

    it('calls next with error on invalid JWT', async () => {
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      const req = createMockReq({
        headers: { authorization: 'Bearer this-is-not-a-valid-jwt' },
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('fixed token', () => {
    // The source reads config.auth.fixedAuthTokens fresh on each call from the
    // shared `config` singleton, so we inject a token by mutating it here and
    // restore it in afterEach. The header is a raw token (no "Bearer " prefix),
    // matching the fixed-token branch in parseAuthHeader.
    it('resolves userId from fixedAuthTokens and promotes the db user to superuser', async () => {
      setFixedAuthTokens([
        { token: 'fixed-secret-token', userId: 42, authProvider: 'openstad' },
      ]);

      // dbUser on config.admin.projectId (1) => promoted to superuser
      const fakeUser = {
        id: 42,
        role: 'admin',
        projectId: config.admin.projectId,
      };
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      db.User.findOne = vi.fn().mockResolvedValue(fakeUser);

      const req = createMockReq({
        headers: { authorization: 'fixed-secret-token' },
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      // findOne is queried by the fixed token's userId only (isFixed bypasses project scoping)
      expect(db.User.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
      expect(req.user).toBe(fakeUser);
      expect(req.user.role).toBe('superuser');
      expect(next).toHaveBeenCalledWith();
    });

    it('keeps the db user role for a fixed token user scoped to a non-admin project', async () => {
      setFixedAuthTokens([
        { token: 'fixed-secret-token', userId: 77, authProvider: 'openstad' },
      ]);

      // projectId differs from config.admin.projectId => role is NOT promoted
      const fakeUser = {
        id: 77,
        role: 'member',
        projectId: config.admin.projectId + 1000,
      };
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      db.User.findOne = vi.fn().mockResolvedValue(fakeUser);

      const req = createMockReq({
        headers: { authorization: 'fixed-secret-token' },
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      expect(req.user).toBe(fakeUser);
      expect(req.user.role).toBe('member');
      expect(next).toHaveBeenCalledWith();
    });
  });

  // Opaque reporting tokens (Bearer osr_…) bypass the JWT/auth-server path and
  // resolve the owner straight from the database.
  describe('API token (Bearer osr_…)', () => {
    const PROJECT_ID = 2; // matches createMockReq's req.project
    const OWNER = { id: 55, role: 'editor', projectId: PROJECT_ID };
    const PLAINTEXT = 'osr_a-perfectly-ordinary-opaque-token';
    const TOKEN_HASH = crypto
      .createHash('sha256')
      .update(PLAINTEXT)
      .digest('hex');
    const MINUTE = 60 * 1000;

    // The middleware falls back to anonymous both on a deliberate rejection and
    // on a swallowed exception. Spying on console.error tells the two apart:
    // only the catch block logs, so a "clean" rejection must log nothing.
    let errorLog;
    beforeEach(() => {
      errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    function apiTokenReq(authorization = `Bearer ${PLAINTEXT}`) {
      return createMockReq({ headers: { authorization } });
    }

    function mockApiToken(overrides = {}) {
      const apiToken = {
        id: 1,
        userId: OWNER.id,
        projectId: PROJECT_ID,
        // Every stored token has an expiry date, so the default fixture has one
        // too; the expiry cases below override it explicitly.
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastUsedAt: null,
        update: vi.fn().mockResolvedValue(undefined),
        ...overrides,
      };
      db.ApiToken.findOne = vi.fn().mockResolvedValue(apiToken);
      return apiToken;
    }

    it('authenticates the owner and looks the token up by its sha256 hash', async () => {
      mockApiToken();
      db.User.findOne = vi.fn().mockResolvedValue(OWNER);

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      // The plaintext is never queried — only its hash.
      expect(db.ApiToken.findOne).toHaveBeenCalledWith({
        where: { tokenHash: TOKEN_HASH },
      });
      expect(req.user).toBe(OWNER);
      expect(req.apiTokenScope).toBe('reports');
      expect(next).toHaveBeenCalledWith();
      expect(errorLog).not.toHaveBeenCalled();
    });

    it('does not authenticate a revoked token', async () => {
      // Revoking soft-deletes the row. The lookup below must keep the model's
      // paranoid default — opting out with `paranoid: false` would hand a
      // revoked token back and make revocation a no-op.
      db.ApiToken.findOne = vi.fn().mockResolvedValue(null);
      db.User.findOne = vi.fn();

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(db.ApiToken.findOne).toHaveBeenCalledWith({
        where: { tokenHash: TOKEN_HASH },
      });
      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(db.User.findOne).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
      expect(errorLog).not.toHaveBeenCalled();
    });

    it('rejects an expired token without looking up its owner', async () => {
      mockApiToken({ expiresAt: new Date(Date.now() - 60 * 1000) });
      db.User.findOne = vi.fn();

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(req.apiTokenScope).toBeUndefined();
      expect(db.User.findOne).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
      // Rejected deliberately, not by way of a swallowed exception.
      expect(errorLog).not.toHaveBeenCalled();
    });

    // The audit entry is written fire-and-forget, so let the microtask queue
    // drain before asserting on it.
    describe('auditing the first use of an expired token', () => {
      const EXPIRED = { expiresAt: new Date(Date.now() - 60 * 1000) };

      async function runAndFlush() {
        const req = apiTokenReq();
        await getUserMiddleware(req, createMockRes(), vi.fn());
        await new Promise((resolve) => setImmediate(resolve));
        return req;
      }

      it('writes a single token_expired entry the first time', async () => {
        const apiToken = mockApiToken(EXPIRED);
        db.AuditLog.findOne = vi.fn().mockResolvedValue(null);
        auditLogService.logDirect = vi.fn();

        await runAndFlush();

        expect(auditLogService.logDirect).toHaveBeenCalledTimes(1);
        const entry = auditLogService.logDirect.mock.calls[0][0];
        expect(entry).toMatchObject({
          action: 'token_expired',
          modelName: 'api-token',
          modelId: apiToken.id,
          projectId: apiToken.projectId,
        });
      });

      it('does not log again once an entry exists', async () => {
        mockApiToken(EXPIRED);
        db.AuditLog.findOne = vi.fn().mockResolvedValue({ id: 1 });
        auditLogService.logDirect = vi.fn();

        await runAndFlush();

        expect(auditLogService.logDirect).not.toHaveBeenCalled();
      });

      it('still rejects the request when the audit write fails', async () => {
        mockApiToken(EXPIRED);
        db.AuditLog.findOne = vi
          .fn()
          .mockRejectedValue(new Error('audit db down'));
        auditLogService.logDirect = vi.fn();

        const req = await runAndFlush();

        expect(req.user).toEqual({ role: 'anonymous', id: null });
      });

      it('does not log for a valid token', async () => {
        mockApiToken({ expiresAt: new Date(Date.now() + 60 * 1000) });
        db.User.findOne = vi.fn().mockResolvedValue(OWNER);
        db.AuditLog.findOne = vi.fn().mockResolvedValue(null);
        auditLogService.logDirect = vi.fn();

        await runAndFlush();

        expect(auditLogService.logDirect).not.toHaveBeenCalled();
      });
    });

    it('accepts a token whose expiry is still ahead', async () => {
      mockApiToken({ expiresAt: new Date(Date.now() + 60 * 1000) });
      db.User.findOne = vi.fn().mockResolvedValue(OWNER);

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toBe(OWNER);
      expect(next).toHaveBeenCalledWith();
    });

    it('rejects a token without an expiry date (fail closed)', async () => {
      mockApiToken({ expiresAt: null });
      db.User.findOne = vi.fn();

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(req.apiTokenScope).toBeUndefined();
      expect(db.User.findOne).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });

    it.each([
      ['extra spaces after the scheme', `Bearer   ${PLAINTEXT}`],
      ['a lowercase scheme', `bearer ${PLAINTEXT}`],
      ['surrounding whitespace', `  Bearer ${PLAINTEXT}\t `],
    ])('accepts a header with %s', async (_label, authorization) => {
      mockApiToken();
      db.User.findOne = vi.fn().mockResolvedValue(OWNER);

      const req = apiTokenReq(authorization);
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      // Same hash as the canonical header: the whitespace never reaches sha256.
      expect(db.ApiToken.findOne).toHaveBeenCalledWith({
        where: { tokenHash: TOKEN_HASH },
      });
      expect(req.user).toBe(OWNER);
      expect(next).toHaveBeenCalledWith();
    });

    it('falls back to anonymous for an unknown token', async () => {
      db.ApiToken.findOne = vi.fn().mockResolvedValue(null);
      db.User.findOne = vi.fn();

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(db.User.findOne).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
      // Rejected deliberately, not by way of a swallowed exception.
      expect(errorLog).not.toHaveBeenCalled();
    });

    it('falls back to anonymous when the owner no longer exists', async () => {
      const apiToken = mockApiToken();
      db.User.findOne = vi.fn().mockResolvedValue(null);

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(apiToken.update).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
      expect(errorLog).not.toHaveBeenCalled();
    });

    it('falls back to anonymous when the token is bound to another project', async () => {
      const apiToken = mockApiToken({ projectId: PROJECT_ID + 100 });
      db.User.findOne = vi
        .fn()
        .mockResolvedValue({ ...OWNER, projectId: PROJECT_ID + 100 });

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(req.apiTokenScope).toBeUndefined();
      expect(apiToken.update).not.toHaveBeenCalled();
      expect(errorLog).not.toHaveBeenCalled();
    });

    it('falls back to anonymous when the request has no project', async () => {
      mockApiToken();
      db.User.findOne = vi.fn().mockResolvedValue(OWNER);

      const req = apiTokenReq();
      req.project = null;
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(errorLog).not.toHaveBeenCalled();
    });

    it('lets an admin-project superuser cross the project binding', async () => {
      mockApiToken({ projectId: config.admin.projectId });
      const superuser = {
        id: 9,
        role: 'admin',
        projectId: config.admin.projectId,
      };
      db.User.findOne = vi.fn().mockResolvedValue(superuser);

      // req.project (2) differs from the token's project, which would be
      // rejected for any non-superuser owner.
      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toBe(superuser);
      expect(req.apiTokenScope).toBe('reports');
      expect(next).toHaveBeenCalledWith();
    });

    it('falls back to anonymous and logs when the token lookup throws', async () => {
      db.ApiToken.findOne = vi.fn().mockRejectedValue(new Error('db down'));

      const req = apiTokenReq();
      const next = vi.fn();

      await getUserMiddleware(req, createMockRes(), next);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(next).toHaveBeenCalledWith();
      expect(errorLog).toHaveBeenCalled();
    });

    describe('lastUsedAt throttling', () => {
      it('records first use when lastUsedAt is null', async () => {
        const apiToken = mockApiToken({ lastUsedAt: null });
        db.User.findOne = vi.fn().mockResolvedValue(OWNER);

        await getUserMiddleware(apiTokenReq(), createMockRes(), vi.fn());

        expect(apiToken.update).toHaveBeenCalledWith({
          lastUsedAt: expect.any(Date),
        });
      });

      it('records use when the stored lastUsedAt is unparseable', async () => {
        const apiToken = mockApiToken({ lastUsedAt: 'not a date' });
        db.User.findOne = vi.fn().mockResolvedValue(OWNER);

        await getUserMiddleware(apiTokenReq(), createMockRes(), vi.fn());

        expect(apiToken.update).toHaveBeenCalledWith({
          lastUsedAt: expect.any(Date),
        });
      });

      it('refreshes lastUsedAt once it is older than the throttle window', async () => {
        const apiToken = mockApiToken({
          lastUsedAt: new Date(Date.now() - 30 * MINUTE),
        });
        db.User.findOne = vi.fn().mockResolvedValue(OWNER);

        await getUserMiddleware(apiTokenReq(), createMockRes(), vi.fn());

        expect(apiToken.update).toHaveBeenCalledTimes(1);
      });

      it('skips the write for a recently used token, so polling costs no UPDATEs', async () => {
        const apiToken = mockApiToken({
          lastUsedAt: new Date(Date.now() - 1 * MINUTE),
        });
        db.User.findOne = vi.fn().mockResolvedValue(OWNER);

        const req = apiTokenReq();
        const next = vi.fn();

        await getUserMiddleware(req, createMockRes(), next);

        expect(apiToken.update).not.toHaveBeenCalled();
        // Skipping the write must not affect authentication.
        expect(req.user).toBe(OWNER);
        expect(next).toHaveBeenCalledWith();
      });
    });
  });
});
