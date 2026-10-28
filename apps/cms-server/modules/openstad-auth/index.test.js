import { describe, expect, it, vi } from 'vitest';

const openstadAuth = require('./index');

function createSelf(existingAposUser) {
  const toObject = vi.fn().mockResolvedValue(existingAposUser);
  return {
    apos: {
      user: {
        find: vi.fn(() => ({ permission: () => ({ toObject }) })),
        update: vi.fn().mockResolvedValue({}),
        insert: vi.fn().mockResolvedValue({}),
      },
      task: {
        getReq: vi.fn(() => ({ role: 'admin' })),
      },
    },
  };
}

function createReq() {
  return {
    url: '/',
    user: undefined,
    session: {},
    data: {
      isAdmin: true,
      isEditor: false,
      openstadUser: {
        id: 54,
        email: 'admin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
      },
    },
    login: vi.fn((user, done) => done()),
  };
}

async function runAposAuthenticate(self) {
  const req = createReq();
  const res = { redirect: vi.fn() };
  const next = vi.fn();
  await openstadAuth.middleware(self).aposAuthenticate(req, res, next);
  return { req, res, next };
}

describe('openstad-auth aposAuthenticate', () => {
  it('updates an existing apostrophe user without changing its password', async () => {
    const self = createSelf({ _id: 'apos-user-1' });

    await runAposAuthenticate(self);

    expect(self.apos.user.update).toHaveBeenCalledTimes(1);
    const userData = self.apos.user.update.mock.calls[0][1];
    expect(userData).toMatchObject({
      _id: 'apos-user-1',
      username: 'openstad_org_54',
      email: 'admin@example.com',
      role: 'admin',
    });
    expect(userData).not.toHaveProperty('password');
  });

  it('inserts a new apostrophe user without setting a password', async () => {
    const self = createSelf(null);

    await runAposAuthenticate(self);

    expect(self.apos.user.insert).toHaveBeenCalledTimes(1);
    const userData = self.apos.user.insert.mock.calls[0][1];
    expect(userData).toMatchObject({
      username: 'openstad_org_54',
      email: 'admin@example.com',
      role: 'admin',
    });
    expect(userData).not.toHaveProperty('password');
  });
});
