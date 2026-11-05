import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const db = require('../db');
const passwordReset = require('./passwordReset');

const makeReq = (overrides = {}) => ({
  query: {},
  body: {},
  client: { clientId: 'client-1' },
  redirectUri: 'https://site.example/return',
  flashed: [],
  flash(kind, payload) {
    this.flashed.push([kind, payload.msg]);
  },
  ...overrides,
});
const makeRes = () => ({
  redirectedTo: null,
  redirect(url) {
    this.redirectedTo = url;
  },
});
const run = (req, res) =>
  new Promise((resolve) => {
    const result = passwordReset.validate(req, res, (err) =>
      resolve({ next: true, err })
    );
    Promise.resolve(result).then(() =>
      setTimeout(() => resolve({ next: false }), 0)
    );
  });

let originalModel;
let originalEnv;
beforeEach(() => {
  originalModel = db.PasswordResetToken;
  originalEnv = process.env.PASSWORD_RESET_TOKEN_MINUTES;
  delete process.env.PASSWORD_RESET_TOKEN_MINUTES;
});
afterEach(() => {
  db.PasswordResetToken = originalModel;
  if (originalEnv === undefined)
    delete process.env.PASSWORD_RESET_TOKEN_MINUTES;
  else process.env.PASSWORD_RESET_TOKEN_MINUTES = originalEnv;
});

describe('password reset token validation', () => {
  test('a valid token continues and exposes the user id', async () => {
    db.PasswordResetToken = { findOne: async () => ({ userId: 42 }) };
    const req = makeReq({ query: { token: 'abc' } });
    const res = makeRes();
    const result = await run(req, res);
    expect(result.next).toBe(true);
    expect(req.userId).toBe(42);
    expect(req.body.userId).toBe(42);
    expect(res.redirectedTo).toBeNull();
  });

  test('a missing token redirects to the forgot form with a message', async () => {
    db.PasswordResetToken = { findOne: async () => null };
    const req = makeReq();
    const res = makeRes();
    const result = await run(req, res);
    expect(result.next).toBe(false);
    expect(res.redirectedTo).toBe(
      '/auth/local/forgot?clientId=client-1&redirect_uri=https%3A%2F%2Fsite.example%2Freturn'
    );
    expect(req.flashed[0][0]).toBe('error');
  });

  test('an expired or used token says so, an unknown token says it is invalid', async () => {
    let calls = 0;
    db.PasswordResetToken = {
      findOne: async () => (++calls === 1 ? null : { userId: 1 }),
    };
    const req = makeReq({ query: { token: 'old' } });
    const res = makeRes();
    await run(req, res);
    expect(req.flashed[0][1]).toMatch(/verlopen of al gebruikt/);
    expect(res.redirectedTo).toMatch(
      /^\/auth\/local\/forgot\?clientId=client-1/
    );

    db.PasswordResetToken = { findOne: async () => null };
    const req2 = makeReq({ body: { token: 'nope' } });
    const res2 = makeRes();
    await run(req2, res2);
    expect(req2.flashed[0][1]).toMatch(/niet geldig/);
  });

  test('a database error does not leak as a 500 but returns to the forgot form', async () => {
    db.PasswordResetToken = {
      findOne: async () => {
        throw new Error('db down');
      },
    };
    const req = makeReq({ query: { token: 'abc' } });
    const res = makeRes();
    const result = await run(req, res);
    expect(result.next).toBe(false);
    expect(res.redirectedTo).toMatch(/^\/auth\/local\/forgot/);
  });

  test('validity window is configurable through PASSWORD_RESET_TOKEN_MINUTES', () => {
    expect(passwordReset.validMinutes()).toBe(60);
    process.env.PASSWORD_RESET_TOKEN_MINUTES = '1440';
    expect(passwordReset.validMinutes()).toBe(1440);
    process.env.PASSWORD_RESET_TOKEN_MINUTES = 'nope';
    expect(passwordReset.validMinutes()).toBe(60);
  });
});
