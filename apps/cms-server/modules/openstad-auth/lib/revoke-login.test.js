import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { revokeLogin } = require('./revoke-login');

const flagOn = { MULTI_PROJECT_LOGIN: 'true' };

describe('revokeLogin', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('revokes the login at the api', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await revokeLogin({
      apiUrl: 'http://api.local',
      projectId: 6,
      jwt: 'jwt-6',
      env: flagOn,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://api.local/auth/project/6/logout',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer jwt-6' },
        signal: expect.any(AbortSignal),
      }
    );
  });

  test('does nothing without multi-project login', async () => {
    const fetchImpl = vi.fn();

    await revokeLogin({
      apiUrl: 'http://api.local',
      projectId: 6,
      jwt: 'jwt-6',
      env: {},
      fetchImpl,
    });

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('does nothing without a login token or project', async () => {
    const fetchImpl = vi.fn();

    await revokeLogin({
      apiUrl: 'http://api.local',
      projectId: 6,
      jwt: undefined,
      env: flagOn,
      fetchImpl,
    });
    await revokeLogin({
      apiUrl: 'http://api.local',
      projectId: undefined,
      jwt: 'jwt-6',
      env: flagOn,
      fetchImpl,
    });

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('resolves when the api cannot be reached', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(
      revokeLogin({
        apiUrl: 'http://api.local',
        projectId: 6,
        jwt: 'jwt-6',
        env: flagOn,
        fetchImpl,
      })
    ).resolves.toBeUndefined();
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('aborts and resolves when the api does not answer in time', async () => {
    const fetchImpl = vi.fn(
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason));
        })
    );

    await expect(
      revokeLogin({
        apiUrl: 'http://api.local',
        projectId: 6,
        jwt: 'jwt-6',
        env: flagOn,
        fetchImpl,
        timeoutMs: 10,
      })
    ).resolves.toBeUndefined();
    expect(fetchImpl.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
