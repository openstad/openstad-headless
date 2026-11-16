import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getKnownIdentities,
  notifyAuthChange,
  onAuthChange,
} from './auth-broker';

const API = 'http://api.local';

const token = (expSeconds: number) => {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256' })}.${encode({ exp: expSeconds })}.sig`;
};
const inAnHour = () => Math.floor(Date.now() / 1000) + 3600;

let stored: Record<string, string>;
const originalWindow = (globalThis as any).window;
const originalDocument = (globalThis as any).document;

const setStorage = (data: object) => {
  stored.openstad = JSON.stringify(data);
};

beforeEach(() => {
  stored = {};
  (globalThis as any).window = Object.assign(new EventTarget(), {
    localStorage: {
      getItem: (key: string) => (key in stored ? stored[key] : null),
    },
  });
  (globalThis as any).document = { cookie: '' };
});

afterEach(() => {
  (globalThis as any).window = originalWindow;
  (globalThis as any).document = originalDocument;
});

describe('getKnownIdentities', () => {
  it('returns tokens of other projects on the same api', () => {
    const jwt = token(inAnHour());
    setStorage({
      2: { openStadUser: { jwt, apiUrl: API } },
      3: { openStadUser: { jwt: token(inAnHour()), apiUrl: API } },
    });

    expect(getKnownIdentities({ apiUrl: API, excludeProjectId: 3 })).toEqual([
      { projectId: '2', jwt },
    ]);
  });

  it('skips tokens of another installation and tokens without an api url', () => {
    setStorage({
      2: {
        openStadUser: { jwt: token(inAnHour()), apiUrl: 'http://other.local' },
      },
      4: { openStadUser: { jwt: token(inAnHour()) } },
    });

    expect(getKnownIdentities({ apiUrl: API })).toEqual([]);
  });

  it('skips expired tokens', () => {
    setStorage({
      2: {
        openStadUser: {
          jwt: token(Math.floor(Date.now() / 1000) - 60),
          apiUrl: API,
        },
      },
    });

    expect(getKnownIdentities({ apiUrl: API })).toEqual([]);
  });

  it('skips expire-on-close logins once the session cookie is gone', () => {
    setStorage({
      2: {
        openStadUser: { jwt: token(inAnHour()), apiUrl: API },
        expireOnClose: true,
      },
    });

    expect(getKnownIdentities({ apiUrl: API })).toEqual([]);
    (globalThis as any).document.cookie = 'openstad_active=1';
    expect(getKnownIdentities({ apiUrl: API })).toHaveLength(1);
  });

  it('returns nothing for corrupt storage', () => {
    stored.openstad = '{not json';

    expect(getKnownIdentities({ apiUrl: API })).toEqual([]);
  });
});

describe('auth change events', () => {
  const storageEvent = (
    oldValue: object | null,
    newValue: object | null,
    key = 'openstad'
  ) =>
    Object.assign(new Event('storage'), {
      key,
      oldValue: oldValue && JSON.stringify(oldValue),
      newValue: newValue && JSON.stringify(newValue),
    });

  it('passes the projects that changed on this page, or null when none are given', () => {
    const callback = vi.fn();
    const unsubscribe = onAuthChange(callback);

    notifyAuthChange(['3']);
    notifyAuthChange();

    expect(callback.mock.calls).toEqual([[['3']], [null]]);

    unsubscribe();
    notifyAuthChange(['3']);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('ignores storage writes that keep every login, such as a refreshed profile', () => {
    const callback = vi.fn();
    const unsubscribe = onAuthChange(callback);
    const before = {
      6: { openStadUser: { id: 1, jwt: 'jwt-6', jwtExpiresInHours: '2.00' } },
    };
    const after = {
      6: { openStadUser: { id: 1, jwt: 'jwt-6', jwtExpiresInHours: '1.99' } },
    };

    window.dispatchEvent(storageEvent(before, after));
    window.dispatchEvent(storageEvent({}, after, 'other'));

    expect(callback).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('passes the projects whose stored login changed in another tab', () => {
    const callback = vi.fn();
    const unsubscribe = onAuthChange(callback);

    window.dispatchEvent(
      storageEvent(
        {
          6: { openStadUser: { jwt: 'jwt-6' } },
          7: { openStadUser: { jwt: 'old-7' } },
        },
        {
          6: { openStadUser: { jwt: 'jwt-6' } },
          7: { openStadUser: JSON.stringify({ jwt: 'new-7' }) },
        }
      )
    );

    expect(callback.mock.calls).toEqual([[['7']]]);
    unsubscribe();
  });

  it('passes every project when another tab logs out or logs in for the first time', () => {
    const callback = vi.fn();
    const unsubscribe = onAuthChange(callback);

    window.dispatchEvent(
      storageEvent(
        {
          6: { openStadUser: { jwt: 'jwt-6' } },
          7: { openStadUser: { jwt: 'jwt-7' } },
        },
        {}
      )
    );
    window.dispatchEvent(
      storageEvent(null, { 8: { openStadUser: { jwt: 'jwt-8' } } })
    );

    expect(callback.mock.calls).toEqual([[['6', '7']], [['8']]]);
    unsubscribe();
  });
});
