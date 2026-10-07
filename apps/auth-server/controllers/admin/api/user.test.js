import { describe, expect, test } from 'vitest';

const userController = require('./user');

const SENSITIVE = ['password', 'hashedPhoneNumber', 'twoFactorToken'];

const fakeUser = () => {
  const dataValues = {
    id: 42,
    email: 'a@example.nl',
    password: 'hash',
    hashedPhoneNumber: 'phonehash',
    twoFactorToken: 'secret',
    twoFactorConfigured: 1,
  };
  return { dataValues, toJSON: () => ({ ...dataValues }) };
};

const capture = (handler, req) => {
  let body;
  handler(req, { json: (b) => (body = b) }, () => {});
  return body;
};

describe('admin api user output', () => {
  test('list output strips sensitive fields', () => {
    const body = capture(userController.all, {
      users: [fakeUser()],
      totalCodeCount: 1,
    });
    for (const key of SENSITIVE) expect(body.data[0]).not.toHaveProperty(key);
    expect(body.data[0].twoFactorConfigured).toBe(1);
  });

  test('single output strips sensitive fields', () => {
    const body = capture(userController.show[0], {
      userObject: fakeUser(),
      clients: [],
      roles: [],
      body: {},
      query: {},
      params: {},
    });
    for (const key of SENSITIVE) expect(body).not.toHaveProperty(key);
    expect(body.twoFactorConfigured).toBe(1);
  });
});
