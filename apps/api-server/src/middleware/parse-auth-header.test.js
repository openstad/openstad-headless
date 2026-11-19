import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';

import { parseAuthHeader } from './parse-auth-header.js';

const jwtSecret = 'test-secret';

describe('parseAuthHeader', () => {
  it('treats a pending token as no auth', () => {
    const pendingJwt = jwt.sign(
      { userId: 1, authProvider: 'openstad', pending: true },
      jwtSecret
    );

    expect(parseAuthHeader(`Bearer ${pendingJwt}`, { jwtSecret })).toEqual({});
  });

  it('resolves userId, authProvider and issuedAt for a regular token', () => {
    const token = jwt.sign(
      { userId: 1, authProvider: 'openstad', iat: 1700000000 },
      jwtSecret
    );

    const parsed = parseAuthHeader(`Bearer ${token}`, { jwtSecret });

    expect(parsed).toEqual({
      userId: 1,
      authProvider: 'openstad',
      issuedAt: 1700000000,
    });
    expect(parsed.tokenProjectId).toBeUndefined();
  });

  it('returns the projectId claim as tokenProjectId', () => {
    const token = jwt.sign(
      { userId: 1, authProvider: 'openstad', projectId: 2, iat: 1700000000 },
      jwtSecret
    );

    expect(parseAuthHeader(`Bearer ${token}`, { jwtSecret })).toEqual({
      userId: 1,
      authProvider: 'openstad',
      tokenProjectId: 2,
      issuedAt: 1700000000,
    });
  });

  it('throws on a token signed with another secret', () => {
    const token = jwt.sign({ userId: 1 }, 'other-secret');

    expect(() => parseAuthHeader(`Bearer ${token}`, { jwtSecret })).toThrow();
  });

  it('throws on an expired token', () => {
    const token = jwt.sign({ userId: 1 }, jwtSecret, { expiresIn: -10 });

    expect(() => parseAuthHeader(`Bearer ${token}`, { jwtSecret })).toThrow();
  });

  it('resolves fixed auth tokens', () => {
    const fixedAuthTokens = [
      { token: 'fixed-token', userId: 42, authProvider: 'openstad' },
    ];

    expect(
      parseAuthHeader('fixed-token', { jwtSecret, fixedAuthTokens })
    ).toEqual({ userId: 42, isFixed: true, authProvider: 'openstad' });
  });

  it('returns no auth for an unknown header', () => {
    expect(parseAuthHeader('unknown', { jwtSecret })).toEqual({});
  });
});
