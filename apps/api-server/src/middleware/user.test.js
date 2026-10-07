import { createRequire } from 'module';
import { afterEach, describe, expect, test, vi } from 'vitest';

const require = createRequire(import.meta.url);

const config = { auth: { jwtSecret: 'test-secret' }, admin: { projectId: 1 } };
require.cache[require.resolve('config')] = { exports: config };
require.cache[require.resolve('../db')] = {
  exports: { User: { findOne: vi.fn() }, Project: { findOne: vi.fn() } },
};
require.cache[require.resolve('../util/auth-settings')] = {
  exports: { config: vi.fn().mockResolvedValue({}), adapter: vi.fn() },
};

const jwt = require('jsonwebtoken');
const getUser = require('./user');

afterEach(() => {
  vi.restoreAllMocks();
});

function expiredToken() {
  return jwt.sign(
    { userId: 1, exp: Math.floor(Date.now() / 1000) - 60 },
    config.auth.jwtSecret
  );
}

function createReq(method, authorization) {
  return {
    method,
    path: '/api/project/1/resource',
    headers: authorization ? { authorization } : {},
  };
}

function createRes() {
  return { set: vi.fn() };
}

async function run(req) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  const res = createRes();
  const next = vi.fn();
  await getUser(req, res, next);
  return { res, next };
}

describe('user middleware with invalid tokens', () => {
  test.each(['GET', 'HEAD', 'OPTIONS'])(
    '%s with expired token continues anonymous and flags the token',
    async (method) => {
      const req = createReq(method, `Bearer ${expiredToken()}`);
      const { res, next } = await run(req);

      expect(req.user).toEqual({ role: 'anonymous', id: null });
      expect(res.set).toHaveBeenCalledWith(
        'WWW-Authenticate',
        'Bearer error="invalid_token"'
      );
      expect(next).toHaveBeenCalledWith();
    }
  );

  test('GET with badly signed token continues anonymous', async () => {
    const req = createReq('GET', 'Bearer eyJhbGciOiJIUzI1NiJ9.e30.invalid');
    const { res, next } = await run(req);

    expect(req.user).toEqual({ role: 'anonymous', id: null });
    expect(res.set).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  test.each(['POST', 'PUT', 'DELETE'])(
    '%s with expired token returns 401',
    async (method) => {
      const req = createReq(method, `Bearer ${expiredToken()}`);
      const { res, next } = await run(req);

      expect(req.user).toBeUndefined();
      expect(res.set).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 })
      );
    }
  );

  test('GET without token continues anonymous without flag', async () => {
    const req = createReq('GET');
    const { res, next } = await run(req);

    expect(req.user).toEqual({ role: 'anonymous', id: null });
    expect(res.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  test('upload request with empty token is not treated as invalid', async () => {
    const req = createReq('POST', 'Bearer undefined');
    req.path = '/api/project/1/upload/images';
    const { res, next } = await run(req);

    expect(res.set).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 })
    );
  });
});
