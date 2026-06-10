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

afterEach(() => {
  db.User.findOne = originalUserFindOne;
  db.Project.findOne = originalProjectFindOne;
  authSettings.config = originalAuthSettingsConfig;
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
    it('resolves userId from fixedAuthTokens and attaches db user as superuser', async () => {
      const fixedTokens = config.auth && config.auth.fixedAuthTokens;
      if (!fixedTokens || !fixedTokens[0]) {
        return; // No fixed tokens configured in this environment
      }

      const fakeUser = { id: 42, role: 'admin', projectId: 1 };
      authSettings.config = vi.fn().mockResolvedValue({
        provider: {},
        adapter: 'openstad',
        default: 'openstad',
      });
      db.User.findOne = vi.fn().mockResolvedValue(fakeUser);

      const req = createMockReq({
        headers: { authorization: fixedTokens[0].token },
      });
      const res = createMockRes();
      const next = vi.fn();

      await getUserMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
