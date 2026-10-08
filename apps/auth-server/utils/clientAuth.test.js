import { describe, expect, it, vi } from 'vitest';

import clientAuth from './clientAuth.js';

let sessionCounter = 0;

function attachSession(req, data = {}) {
  sessionCounter += 1;
  req.session = {
    ...data,
    id: `sid-${sessionCounter}`,
    regenerate(cb) {
      attachSession(req);
      cb(null);
    },
    save(cb) {
      if (cb) cb(null);
    },
  };
  return req.session;
}

function loginWith(req, user) {
  return new Promise((resolve, reject) => {
    clientAuth.loginWithFreshSession(req, user, (err) =>
      err ? reject(err) : resolve()
    );
  });
}

const twoClientAuth = () => ({
  1: { authType: 'Url', role: 'member', twoFactorValid: false },
  2: { authType: 'UniqueCode', role: 'member', twoFactorValid: false },
});

describe('regenerateSession', () => {
  it('changes the session id and drops clientAuth by default', async () => {
    const req = {};
    attachSession(req, { clientAuth: twoClientAuth() });
    const oldSessionId = req.session.id;

    await clientAuth.regenerateSession(req);

    expect(req.session.id).not.toBe(oldSessionId);
    expect(req.session.clientAuth).toBeUndefined();
  });

  it('keeps clientAuth of all clients when explicitly asked to preserve it', async () => {
    const req = {};
    attachSession(req, { clientAuth: twoClientAuth() });
    const oldSessionId = req.session.id;
    const oldClientAuth = req.session.clientAuth;

    await clientAuth.regenerateSession(req, { preserveClientAuth: true });

    expect(req.session.id).not.toBe(oldSessionId);
    expect(req.session.clientAuth).toEqual(oldClientAuth);
  });

  it('leaves a session without clientAuth clean', async () => {
    const req = {};
    attachSession(req);

    await clientAuth.regenerateSession(req, { preserveClientAuth: true });

    expect(req.session.clientAuth).toBeUndefined();
  });

  it('rejects when regeneration fails', async () => {
    const req = {
      session: {
        regenerate(cb) {
          cb(new Error('store down'));
        },
      },
    };

    await expect(clientAuth.regenerateSession(req)).rejects.toThrow(
      'store down'
    );
  });
});

describe('initializeClientAuth', () => {
  it('stamps a fresh authenticatedAt so a re-login extends the session window', async () => {
    const session = {
      clientAuth: {
        7: {
          authenticatedAt: 1,
          role: 'admin',
          authType: 'Local',
          twoFactorValid: false,
        },
      },
    };

    await clientAuth.initializeClientAuth(
      session,
      { id: 7 },
      { id: 5 },
      { role: 'admin', authType: 'Local', twoFactorValid: false }
    );

    expect(session.clientAuth[7].authenticatedAt).toBeGreaterThan(1);
  });
});

describe('setClientAuth', () => {
  it('keeps the original authenticatedAt when it is not passed explicitly', () => {
    const session = {
      clientAuth: { 7: { authenticatedAt: 1, role: 'member' } },
    };

    clientAuth.setClientAuth(session, { id: 7 }, { role: 'admin' });

    expect(session.clientAuth[7].authenticatedAt).toBe(1);
  });
});

describe('isSameSessionUser', () => {
  it('matches the serialized passport user against the user logging in', () => {
    expect(
      clientAuth.isSameSessionUser({ passport: { user: 5 } }, { id: 5 })
    ).toBe(true);
    expect(
      clientAuth.isSameSessionUser({ passport: { user: '5' } }, { id: 5 })
    ).toBe(true);
  });

  it('is false for another user, an anonymous session or a missing id', () => {
    expect(
      clientAuth.isSameSessionUser({ passport: { user: 5 } }, { id: 6 })
    ).toBe(false);
    expect(clientAuth.isSameSessionUser({}, { id: 5 })).toBe(false);
    expect(clientAuth.isSameSessionUser({ passport: {} }, { id: 5 })).toBe(
      false
    );
    expect(clientAuth.isSameSessionUser({ passport: { user: 5 } }, {})).toBe(
      false
    );
  });
});

describe('loginWithFreshSession', () => {
  it('regenerates and keeps other client logins when the same user logs in again', async () => {
    const req = {};
    attachSession(req, {
      clientAuth: {
        1: { authType: 'Url', role: 'member', twoFactorValid: false },
      },
      passport: { user: 5 },
    });
    const oldSessionId = req.session.id;
    req.logIn = vi.fn((user, options, done) => done(null));
    const user = { id: 5 };

    await loginWith(req, user);

    expect(req.logIn).toHaveBeenCalledWith(
      user,
      { keepSessionInfo: true },
      expect.any(Function)
    );
    expect(req.session.id).not.toBe(oldSessionId);
    expect(req.session.clientAuth).toEqual({
      1: { authType: 'Url', role: 'member', twoFactorValid: false },
    });
  });

  it('drops a previous user client auth so a planted twoFactorValid cannot be inherited', async () => {
    const req = {};
    attachSession(req, {
      clientAuth: {
        1: { authType: 'Local', role: 'admin', twoFactorValid: true },
      },
      passport: { user: 5 },
    });
    req.logIn = vi.fn((user, options, done) => done(null));

    await loginWith(req, { id: 6 });

    expect(req.session.clientAuth).toBeUndefined();
  });

  it('drops client auth planted by an anonymous session before login', async () => {
    const req = {};
    attachSession(req, {
      clientAuth: {
        1: { authType: 'Local', role: 'admin', twoFactorValid: true },
      },
    });
    req.logIn = vi.fn((user, options, done) => done(null));

    await loginWith(req, { id: 6 });

    expect(req.session.clientAuth).toBeUndefined();
  });

  it('passes a regeneration error to the callback', async () => {
    const req = {
      session: {
        regenerate(cb) {
          cb(new Error('store down'));
        },
      },
      logIn: vi.fn(),
    };

    const err = await new Promise((resolve) => {
      clientAuth.loginWithFreshSession(req, { id: 5 }, resolve);
    });

    expect(err).toBeInstanceOf(Error);
    expect(req.logIn).not.toHaveBeenCalled();
  });
});
