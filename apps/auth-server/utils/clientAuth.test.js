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

describe('regenerateSession', () => {
  it('changes the session id and keeps clientAuth of all clients', async () => {
    const req = {};
    attachSession(req, {
      clientAuth: {
        1: { authType: 'Url', role: 'member', twoFactorValid: false },
        2: { authType: 'UniqueCode', role: 'member', twoFactorValid: false },
      },
    });
    const oldSessionId = req.session.id;
    const oldClientAuth = req.session.clientAuth;

    await clientAuth.regenerateSession(req);

    expect(req.session.id).not.toBe(oldSessionId);
    expect(req.session.clientAuth).toEqual(oldClientAuth);
  });

  it('leaves a session without clientAuth clean', async () => {
    const req = {};
    attachSession(req);

    await clientAuth.regenerateSession(req);

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

describe('loginWithFreshSession', () => {
  it('regenerates before logIn and keeps session info', async () => {
    const req = {};
    attachSession(req, {
      clientAuth: {
        1: { authType: 'Url', role: 'member', twoFactorValid: false },
      },
    });
    const oldSessionId = req.session.id;
    req.logIn = vi.fn((user, options, done) => done(null));
    const user = { id: 5 };

    await new Promise((resolve, reject) => {
      clientAuth.loginWithFreshSession(req, user, (err) =>
        err ? reject(err) : resolve()
      );
    });

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
