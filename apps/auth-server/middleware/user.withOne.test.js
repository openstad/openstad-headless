import { afterEach, describe, expect, test } from 'vitest';

const db = require('../db');
const userMw = require('./user');

const run = (mw, req) =>
  new Promise((resolve) => {
    mw(req, {}, (err) => resolve(err));
  });

describe('userMw.withOne', () => {
  const originalScope = db.User.scope;

  afterEach(() => {
    db.User.scope = originalScope;
  });

  test('passes a 404 error when the user does not exist', async () => {
    db.User.scope = () => ({ findOne: async () => null });
    const req = { body: {}, params: { userId: '999' } };

    const err = await run(userMw.withOne, req);

    expect(err?.status).toBe(404);
    expect(req.userObject).toBeUndefined();
  });

  test('sets the user object when the user exists', async () => {
    const user = { id: 42 };
    db.User.scope = () => ({ findOne: async () => user });
    const req = { body: {}, params: { userId: '42' } };

    const err = await run(userMw.withOne, req);

    expect(err).toBeUndefined();
    expect(req.userObject).toBe(user);
  });
});
