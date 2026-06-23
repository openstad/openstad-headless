import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Use createRequire so we get the same CJS module.exports reference as user.js does
const require = createRequire(import.meta.url);
const db = require('../db');
const authSettings = require('../util/auth-settings');
const config = require('config');
const getUserMiddleware = require('./user.js');

const JWT_SECRET = config.auth.jwtSecret;

// Store originals for clean restoration
const originalUserFindOne = db.User.findOne;
const originalProjectFindOne = db.Project.findOne;
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
  authSettings.config = originalAuthSettingsConfig;
  // Restore fixedAuthTokens in case a test mutated the shared config singleton
  setFixedAuthTokens(originalFixedAuthTokens);
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
});
