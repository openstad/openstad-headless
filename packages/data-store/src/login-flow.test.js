import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  exchangeKnownIdentities,
  outcomeFromCodeResult,
  outcomeFromFieldsResult,
  popupLoginUrl,
  waitForPopupLogin,
} from './login-flow';

const apiReturning = (...results) => ({
  user: {
    exchangeLogin: vi.fn(async () => results.shift()),
  },
});

describe('exchangeKnownIdentities', () => {
  test('logs in directly when an identity can be exchanged', async () => {
    const api = apiReturning({ status: 200, data: { jwt: 'jwt-3' } });

    expect(
      await exchangeKnownIdentities({
        api,
        projectId: 3,
        identities: [{ jwt: 'jwt-2' }],
      })
    ).toEqual({ type: 'loggedIn', jwt: 'jwt-3' });
    expect(api.user.exchangeLogin).toHaveBeenCalledWith({
      projectId: 3,
      sourceJwt: 'jwt-2',
    });
  });

  test('tries the next identity after a refusal', async () => {
    const api = apiReturning(
      { status: 401, data: { status: 'not_allowed' } },
      { status: 409, data: { status: 'uniquecode_required' } }
    );

    expect(
      await exchangeKnownIdentities({
        api,
        projectId: 3,
        identities: [{ jwt: 'a' }, { jwt: 'b' }],
      })
    ).toEqual({ type: 'uniquecode' });
  });

  test('asks for the missing fields with the project labels', async () => {
    const api = apiReturning({
      status: 409,
      data: {
        status: 'fields_required',
        missingFields: ['name'],
        pendingJwt: 'p',
        labels: { name: 'Je naam' },
        privacy: null,
      },
    });

    expect(
      await exchangeKnownIdentities({
        api,
        projectId: 3,
        identities: [{ jwt: 'a' }],
      })
    ).toEqual({
      type: 'fields',
      pendingJwt: 'p',
      missingFields: ['name'],
      labels: { name: 'Je naam' },
      privacy: null,
    });
  });

  test('falls back to the redirect for 2FA and when nothing is known', async () => {
    const api = apiReturning({
      status: 409,
      data: { status: 'two_factor_required' },
    });

    expect(
      await exchangeKnownIdentities({
        api,
        projectId: 3,
        identities: [{ jwt: 'a' }],
      })
    ).toEqual({ type: 'redirect' });
    expect(
      await exchangeKnownIdentities({
        api: apiReturning(),
        projectId: 3,
        identities: [],
      })
    ).toEqual({ type: 'redirect' });
  });
});

describe('unique code and field results', () => {
  test('turns code refusals into dialog errors', () => {
    expect(outcomeFromCodeResult({ status: 400, data: {} })).toEqual({
      type: 'error',
      error: 'code_required',
    });
    expect(outcomeFromCodeResult({ status: 401, data: {} })).toEqual({
      type: 'error',
      error: 'invalid_code',
    });
    expect(outcomeFromCodeResult({ status: 429, data: {} })).toEqual({
      type: 'error',
      error: 'too_many_attempts',
    });
    expect(
      outcomeFromCodeResult({ status: 429, data: { status: 'client_locked' } })
    ).toEqual({ type: 'redirect' });
    expect(outcomeFromCodeResult({ status: 200, data: { jwt: 'j' } })).toEqual({
      type: 'loggedIn',
      jwt: 'j',
    });
  });

  test('keeps asking for fields that are still missing and flags a wrong access code', () => {
    expect(
      outcomeFromFieldsResult({
        status: 422,
        data: { status: 'invalid_fields', invalidFields: ['accessCode'] },
      })
    ).toEqual({
      type: 'error',
      error: 'invalid_access_code',
      invalidFields: ['accessCode'],
    });
    expect(
      outcomeFromFieldsResult({
        status: 422,
        data: { status: 'invalid_fields', invalidFields: ['postcode'] },
      })
    ).toEqual({
      type: 'error',
      error: 'invalid_fields',
      invalidFields: ['postcode'],
    });
    expect(
      outcomeFromFieldsResult({
        status: 409,
        data: {
          status: 'fields_required',
          missingFields: ['city'],
          pendingJwt: 'p2',
        },
      })
    ).toMatchObject({
      type: 'fields',
      missingFields: ['city'],
      pendingJwt: 'p2',
    });
    expect(outcomeFromFieldsResult({ status: 401, data: {} })).toEqual({
      type: 'redirect',
    });
  });
});

describe('popupLoginUrl', () => {
  test('adds popup=1 and keeps the encoded redirect uri', () => {
    const url = popupLoginUrl(
      'https://api.example.com/auth/project/2/login?useAuth=default&redirectUri=https%3A%2F%2Fsite%2Fpage%3Fa%3D1%26b%3D2'
    );

    const params = new URL(url).searchParams;
    expect(params.get('popup')).toBe('1');
    expect(params.get('useAuth')).toBe('default');
    expect(params.get('redirectUri')).toBe('https://site/page?a=1&b=2');
  });
});

describe('waitForPopupLogin', () => {
  const apiOrigin = 'https://api.example.com';
  let listeners;
  let win;
  let popup;

  const send = (event) => listeners.forEach((listener) => listener(event));
  const message = (overrides = {}) => ({
    source: popup,
    origin: apiOrigin,
    data: { type: 'openstad-login', projectId: 2, jwt: 'jwt-2' },
    ...overrides,
  });

  beforeEach(() => {
    vi.useFakeTimers();
    listeners = new Set();
    popup = { closed: false };
    win = {
      addEventListener: (type, listener) => listeners.add(listener),
      removeEventListener: (type, listener) => listeners.delete(listener),
      setInterval: (callback, ms) => setInterval(callback, ms),
      clearInterval: (id) => clearInterval(id),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wait = () =>
    waitForPopupLogin({ popup, apiOrigin, projectId: '2', win });

  test('resolves with the jwt from the popup', async () => {
    const result = wait();
    send(message());

    expect(await result).toBe('jwt-2');
    expect(listeners.size).toBe(0);
  });

  test.each([
    ['another origin', { origin: 'https://evil.example.com' }],
    ['another window', { source: {} }],
    [
      'another project',
      { data: { type: 'openstad-login', projectId: 3, jwt: 'jwt-3' } },
    ],
    ['another type', { data: { type: 'other', projectId: 2, jwt: 'jwt-2' } }],
    [
      'a jwt that is not a string',
      { data: { type: 'openstad-login', projectId: 2, jwt: { a: 1 } } },
    ],
    ['a message without data', { data: null }],
  ])('ignores a message from %s', async (label, overrides) => {
    const result = wait();
    send(message(overrides));
    popup.closed = true;
    vi.advanceTimersByTime(500);

    expect(await result).toBe(null);
  });

  test('resolves with null when the popup is closed', async () => {
    const result = wait();
    popup.closed = true;
    vi.advanceTimersByTime(500);

    expect(await result).toBe(null);
    expect(listeners.size).toBe(0);
  });
});
