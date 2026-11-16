import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');
const clientAuth = require('../utils/clientAuth');
const reuseSessionForAdminLogin = require('./adminLoginSessionReuse');

const siteClient = { id: 9, clientId: 'site-client' };

const run = async ({
  authenticated = true,
  role = 'editor',
  client = siteClient,
} = {}) => {
  vi.spyOn(db.Client, 'findOne').mockResolvedValue(client);
  vi.spyOn(clientAuth, 'resolveRoleForClient').mockResolvedValue(role);
  const req = {
    query: {
      client_id: client?.clientId,
      redirect_uri: 'https://api.example/back',
    },
    originalUrl: `/auth/admin/login?client_id=${client?.clientId}&redirect_uri=https%3A%2F%2Fapi.example%2Fback`,
    isAuthenticated: () => authenticated,
    user: authenticated ? { id: 5 } : undefined,
    session: { save: (cb) => cb() },
  };
  const res = { redirect: vi.fn() };
  const next = vi.fn();
  await reuseSessionForAdminLogin(req, res, next);
  return { req, res, next };
};

describe('reuseSessionForAdminLogin', () => {
  beforeEach(() => {
    process.env.MULTI_PROJECT_LOGIN = 'true';
  });

  afterEach(() => {
    delete process.env.MULTI_PROJECT_LOGIN;
    vi.restoreAllMocks();
  });

  it('reuses the session of a privileged user and always asks for 2FA', async () => {
    const { req, res, next } = await run();

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      '/dialog/authorize?client_id=site-client&redirect_uri=https%3A%2F%2Fapi.example%2Fback'
    );
    expect(clientAuth.getClientAuth(req.session, siteClient)).toMatchObject({
      role: 'editor',
      twoFactorRequired: true,
    });
  });

  it('shows the admin login screen without a session', async () => {
    const { res, next } = await run({ authenticated: false });
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('shows the admin login screen for a user without a privileged role', async () => {
    const { res, next } = await run({ role: 'member' });
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('never reuses the session for the admin panel client', async () => {
    const { res, next } = await run({ client: { id: 1, clientId: 'admin' } });
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('changes nothing without multi-project login', async () => {
    delete process.env.MULTI_PROJECT_LOGIN;
    const { res, next } = await run();
    expect(db.Client.findOne).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
});
