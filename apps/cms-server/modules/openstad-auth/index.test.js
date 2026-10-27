import { afterEach, describe, expect, it, vi } from 'vitest';

const { middleware } = require('./index');

function setup({ existingUser }) {
  const self = {
    apos: {
      user: {
        find: () => ({
          permission: () => ({ toObject: async () => existingUser }),
        }),
        update: vi.fn(async (req, doc) => doc),
        insert: vi.fn(async (req, doc) => ({ ...doc, _id: 'new-id' })),
      },
      task: { getReq: () => ({}) },
    },
  };
  const req = {
    data: {
      isEditor: true,
      openstadUser: { id: 5, email: 'zoe@example.org' },
    },
    session: {},
    url: '/page',
    login: vi.fn((user, cb) => cb()),
  };
  const res = { redirect: vi.fn() };
  const next = vi.fn();
  return { self, req, res, next };
}

function setupAuthenticate({ cachedUser, lastCheck }) {
  const self = { apos: { permissions: { can: () => true } } };
  const req = {
    query: {},
    headers: {},
    get: () => 'cms.example.org',
    protocol: 'https',
    originalUrl: '/page',
    url: '/page',
    project: { id: 1 },
    data: {},
    session: {
      openstadLoginToken: 'jwt',
      openstadUser: cachedUser,
      openStadlastJWTCheck: lastCheck,
      save: vi.fn((cb) => cb()),
      destroy: vi.fn((cb) => cb()),
    },
  };
  const res = { redirect: vi.fn() };
  const next = vi.fn();
  return { self, req, res, next };
}

describe('authenticate', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the session when the /me check fails with a 5xx', async () => {
    const cachedUser = { id: 5, role: 'editor', email: 'zoe@example.org' };
    const lastCheck = Date.now() - 60 * 1000;
    const { self, req, res, next } = setupAuthenticate({
      cachedUser,
      lastCheck,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 }))
    );

    await middleware(self).authenticate(req, res, next);

    expect(req.session.destroy).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.data.isEditor).toBe(true);
    expect(req.session.openStadlastJWTCheck).toBe(lastCheck);
  });

  it('drops cached privileges after the grace window but keeps the session', async () => {
    const cachedUser = { id: 5, role: 'editor', email: 'zoe@example.org' };
    const lastCheck = Date.now() - 10 * 60 * 1000;
    const { self, req, res, next } = setupAuthenticate({
      cachedUser,
      lastCheck,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 }))
    );

    await middleware(self).authenticate(req, res, next);

    expect(req.session.destroy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.data.isEditor).toBeUndefined();
  });

  it('destroys the session on a 4xx other than 429', async () => {
    const cachedUser = { id: 5, role: 'editor', email: 'zoe@example.org' };
    const { self, req, res, next } = setupAuthenticate({ cachedUser });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 401 }))
    );

    await middleware(self).authenticate(req, res, next);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('destroys the session when /me returns no user', async () => {
    const cachedUser = { id: 5, role: 'editor', email: 'zoe@example.org' };
    const { self, req, res, next } = setupAuthenticate({ cachedUser });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({}) }))
    );

    await middleware(self).authenticate(req, res, next);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
    expect(next).not.toHaveBeenCalled();
  });
});

describe('aposAuthenticate', () => {
  it('updates an existing user without resending a password', async () => {
    const existingUser = {
      _id: 'existing-id',
      email: 'zoe@example.org',
      role: 'admin',
      title: 'zoe@example.org',
    };
    const { self, req, res, next } = setup({ existingUser });

    await middleware(self).aposAuthenticate(req, res, next);

    expect(self.apos.user.insert).not.toHaveBeenCalled();
    const [, doc] = self.apos.user.update.mock.calls[0];
    expect(doc._id).toBe('existing-id');
    expect(doc.role).toBe('editor');
    expect(doc).not.toHaveProperty('password');
    expect(req.login.mock.calls[0][0]._id).toBe('existing-id');
    expect(res.redirect).toHaveBeenCalledWith('/page');
  });

  it('inserts a new user with a password and logs in the inserted doc', async () => {
    const { self, req, res, next } = setup({ existingUser: null });

    await middleware(self).aposAuthenticate(req, res, next);

    expect(self.apos.user.update).not.toHaveBeenCalled();
    const [, doc] = self.apos.user.insert.mock.calls[0];
    expect(doc.password).toEqual(expect.any(String));
    expect(doc.username).toBe('openstad_org_5');
    expect(req.login.mock.calls[0][0]._id).toBe('new-id');
    expect(res.redirect).toHaveBeenCalledWith('/page');
  });

  it('passes a save error to next instead of logging in', async () => {
    const { self, req, res, next } = setup({ existingUser: null });
    self.apos.user.insert = vi.fn(async () => {
      throw new Error('duplicate key');
    });

    await middleware(self).aposAuthenticate(req, res, next);

    expect(req.login).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
