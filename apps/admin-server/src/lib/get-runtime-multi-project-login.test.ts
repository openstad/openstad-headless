import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getRuntimeMultiProjectLogin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('asks again after a failed request instead of remembering false', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ multiProjectLogin: true }),
      });
    vi.stubGlobal('fetch', fetchMock);
    const { getRuntimeMultiProjectLogin } =
      await import('./get-runtime-multi-project-login');

    expect(await getRuntimeMultiProjectLogin()).toBe(false);
    expect(await getRuntimeMultiProjectLogin()).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
