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
  it('calls back on a change on this page and on storage changes for openstad only', () => {
    const callback = vi.fn();
    const unsubscribe = onAuthChange(callback);

    notifyAuthChange();
    window.dispatchEvent(
      Object.assign(new Event('storage'), { key: 'openstad' })
    );
    window.dispatchEvent(Object.assign(new Event('storage'), { key: 'other' }));

    expect(callback).toHaveBeenCalledTimes(2);

    unsubscribe();
    notifyAuthChange();
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
