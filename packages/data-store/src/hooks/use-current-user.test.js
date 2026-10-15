import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

let capturedFetcher;
vi.mock('swr', () => ({
  default: (_key, fetcher) => {
    capturedFetcher = fetcher;
    return { data: undefined, error: undefined, isLoading: true };
  },
}));

const { default: useCurrentUser } = await import('./use-current-user');

function createLocalStorage(initial = {}) {
  const items = { ...initial };
  return {
    getItem: (key) => items[key] ?? null,
    setItem: (key, value) => {
      items[key] = String(value);
    },
  };
}

// All DataStores on a page share one API instance (window.OpenStadAPI)
function createSharedApi(fetchMe) {
  return { currentUserJWT: 'valid', user: { fetchMe } };
}

function runGetCurrentUser(store, props = {}) {
  useCurrentUser.call(store, props);
  return capturedFetcher();
}

describe('useCurrentUser with a shared API instance', () => {
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    global.window = {
      location: { search: '', href: 'https://example.com/' },
      localStorage: createLocalStorage({
        openstad: JSON.stringify({ 6: { openStadUser: { jwt: 'valid' } } }),
      }),
    };
    global.document = { cookie: '' };
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  test('skips /me for a store without projectId', async () => {
    const fetchMe = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    const api = createSharedApi(fetchMe);
    global.globalOpenStadUser = { jwt: 'valid' };

    try {
      await expect(
        runGetCurrentUser({ projectId: undefined, api, refresh: vi.fn() })
      ).resolves.toEqual({});
    } finally {
      delete global.globalOpenStadUser;
    }
    expect(fetchMe).not.toHaveBeenCalled();
    expect(api.currentUserJWT).toBe('valid');
  });

  test('failed /me keeps the shared JWT', async () => {
    const api = createSharedApi(
      vi.fn().mockRejectedValue(new Error('Failed to fetch'))
    );

    await expect(
      runGetCurrentUser(
        { projectId: 6, api, refresh: vi.fn() },
        { projectId: 6 }
      )
    ).resolves.toEqual({});
    expect(api.currentUserJWT).toBe('valid');
  });

  test('/me without user keeps the shared JWT', async () => {
    const api = createSharedApi(vi.fn().mockResolvedValue({}));

    await expect(
      runGetCurrentUser(
        { projectId: 6, api, refresh: vi.fn() },
        { projectId: 6 }
      )
    ).resolves.toEqual({});
    expect(api.currentUserJWT).toBe('valid');
  });
});
