import { describe, expect, test, vi } from 'vitest';

const testSessionSecret = '123secret';
vi.stubEnv('SESSION_SECRET', testSessionSecret);

const config = require('./index');

describe('config', () => {
  test('should calculate expiration date correctly', () => {
    const expirationDate = config.token.calculateExpirationDate();

    expect(expirationDate).toEqual(expect.any(Date));
  });

  test('should have expiresIn as a number', () => {
    expect(config.token.expiresIn).toEqual(expect.any(Number));
  });

  test('codeToken should have expiresIn as a number', () => {
    expect(config.codeToken.expiresIn).toEqual(expect.any(Number));
  });

  test('refreshToken should have expiresIn as a number', () => {
    expect(config.refreshToken.expiresIn).toEqual(expect.any(Number));
  });

  test('should have db timeToCheckExpiredTokens as a number', () => {
    expect(config.db.timeToCheckExpiredTokens).toEqual(expect.any(Number));
  });

  test('should have session maxAge as a number', () => {
    expect(config.session.maxAge).toEqual(expect.any(Number));
  });

  test('should have session secret as a string', () => {
    expect(config.session.secret).toEqual(testSessionSecret);
  });
});
