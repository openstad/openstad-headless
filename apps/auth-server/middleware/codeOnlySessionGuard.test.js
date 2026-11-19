import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const clientAuth = require('../utils/clientAuth');
const endCodeOnlySessionForOtherClients = require('./codeOnlySessionGuard');

const urlClient = { id: 7, clientId: 'url-client', authTypes: ['Url'] };
const codeClient = {
  id: 8,
  clientId: 'code-client',
  authTypes: ['UniqueCode'],
};
const codeOnlyUser = {
  id: 5,
  email: null,
  phoneNumber: null,
  hashedPhoneNumber: null,
};

const run = async ({ user = codeOnlyUser, client = urlClient } = {}) => {
  const destroy = vi.fn((cb) => cb());
  const req = {
    user,
    client,
    redirectUri: 'https://api.example/back',
    session: { destroy },
  };
  const res = { redirect: vi.fn() };
  const next = vi.fn();
  await endCodeOnlySessionForOtherClients(req, res, next);
  return { destroy, res, next };
};

describe('endCodeOnlySessionForOtherClients', () => {
  beforeEach(() => {
    process.env.MULTI_PROJECT_LOGIN = 'true';
    vi.spyOn(clientAuth, 'resolveRoleForClient').mockResolvedValue('member');
  });

  afterEach(() => {
    delete process.env.MULTI_PROJECT_LOGIN;
    vi.restoreAllMocks();
  });

  it('keeps the session of an admin without e-mail address, such as the seeded first admin', async () => {
    clientAuth.resolveRoleForClient.mockResolvedValue('admin');
    const { destroy, next } = await run();
    expect(destroy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('ends the session of a vote code identity on a client without vote codes', async () => {
    const { destroy, res, next } = await run();

    expect(destroy).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      '/login?clientId=url-client&redirect_uri=https%3A%2F%2Fapi.example%2Fback'
    );
  });

  it('keeps the session on a client that accepts vote codes', async () => {
    const { destroy, next } = await run({ client: codeClient });
    expect(destroy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('keeps the session of a user with an e-mail address or a phone number', async () => {
    const withEmail = await run({
      user: { ...codeOnlyUser, email: 'a@example.com' },
    });
    const withPhone = await run({
      user: { ...codeOnlyUser, hashedPhoneNumber: 'hash' },
    });

    expect(withEmail.destroy).not.toHaveBeenCalled();
    expect(withEmail.next).toHaveBeenCalledWith();
    expect(withPhone.destroy).not.toHaveBeenCalled();
    expect(withPhone.next).toHaveBeenCalledWith();
  });

  it('changes nothing without multi-project login', async () => {
    delete process.env.MULTI_PROJECT_LOGIN;
    const { destroy, next } = await run();
    expect(destroy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
});
