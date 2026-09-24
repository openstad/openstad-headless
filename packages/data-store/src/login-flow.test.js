import { describe, expect, test, vi } from 'vitest';

import {
  exchangeKnownIdentities,
  outcomeFromCodeResult,
  outcomeFromFieldsResult,
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
    expect(outcomeFromCodeResult({ status: 200, data: { jwt: 'j' } })).toEqual({
      type: 'loggedIn',
      jwt: 'j',
    });
  });

  test('keeps asking for fields that are still missing and flags a wrong access code', () => {
    expect(outcomeFromFieldsResult({ status: 422, data: {} })).toEqual({
      type: 'error',
      error: 'invalid_access_code',
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
