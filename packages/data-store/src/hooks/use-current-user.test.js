import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { LocalStorage } from '../../../lib/local-storage';
import { consumeLoginTokenFromUrl, pickInitialUser } from './use-current-user';

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

function createSharedApi(fetchMe) {
  return { currentUserJWT: 'valid', user: { fetchMe } };
}

function runGetCurrentUser(store, props = {}) {
  useCurrentUser.call(store, props);
  return capturedFetcher();
}

describe('consumeLoginTokenFromUrl', () => {
  test('consumes the token when openstadprojectid matches the widget project', () => {
    const result = consumeLoginTokenFromUrl({
      search: '?openstadlogintoken=jwt-x&openstadprojectid=2',
      projectId: 2,
    });

    expect(result.jwt).toBe('jwt-x');
    expect(result.search).toBe('');
  });

  test('leaves the token alone for a widget of another project', () => {
    const search = '?openstadlogintoken=jwt-x&openstadprojectid=2';
    const result = consumeLoginTokenFromUrl({ search, projectId: 1 });

    expect(result.jwt).toBeNull();
    expect(result.search).toBe(search);
  });

  test('consumes the token without openstadprojectid (backwards compatible)', () => {
    const resultOne = consumeLoginTokenFromUrl({
      search: '?openstadlogintoken=jwt-x',
      projectId: 1,
    });
    const resultTwo = consumeLoginTokenFromUrl({
      search: '?openstadlogintoken=jwt-x',
      projectId: 2,
    });

    expect(resultOne.jwt).toBe('jwt-x');
    expect(resultTwo.jwt).toBe('jwt-x');
  });

  test('keeps unrelated query params when consuming', () => {
    const result = consumeLoginTokenFromUrl({
      search: '?foo=bar&openstadlogintoken=jwt-x&openstadprojectid=2',
      projectId: '2',
    });

    expect(result.jwt).toBe('jwt-x');
    expect(result.search).toBe('?foo=bar');
  });

  test('returns no token when the url has none', () => {
    const result = consumeLoginTokenFromUrl({
      search: '?foo=bar',
      projectId: 1,
    });

    expect(result.jwt).toBeNull();
    expect(result.search).toBe('?foo=bar');
  });
});

describe('pickInitialUser', () => {
  test('uses the global user when its projectId matches', () => {
    const globalUser = { id: 12, jwt: 'jwt-1', projectId: 1 };

    expect(
      pickInitialUser({ globalUser, propsUser: undefined, projectId: 1 })
    ).toBe(globalUser);
  });

  test('ignores the global user of another project', () => {
    const globalUser = { id: 12, jwt: 'jwt-1', projectId: 1 };

    expect(
      pickInitialUser({ globalUser, propsUser: undefined, projectId: 2 })
    ).toEqual({});
  });

  test('uses a global user without projectId for every widget (backwards compatible)', () => {
    const globalUser = { id: 12, jwt: 'jwt-1' };

    expect(
      pickInitialUser({ globalUser, propsUser: undefined, projectId: 1 })
    ).toBe(globalUser);
    expect(
      pickInitialUser({ globalUser, propsUser: undefined, projectId: 2 })
    ).toBe(globalUser);
  });

  test('falls back to the props user when the global user is for another project', () => {
    const globalUser = { id: 12, jwt: 'jwt-1', projectId: 1 };
    const propsUser = { id: 34, jwt: 'jwt-2' };

    expect(pickInitialUser({ globalUser, propsUser, projectId: 2 })).toBe(
      propsUser
    );
  });
});

describe('project-scoped token pickup with namespaced storage', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = global.window;
    const stored = {};
    global.window = {
      localStorage: {
        getItem: (key) => (key in stored ? stored[key] : null),
        setItem: (key, value) => {
          stored[key] = String(value);
        },
        removeItem: (key) => {
          delete stored[key];
        },
      },
    };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  test('only the target project namespace receives the token', () => {
    const search = '?openstadlogintoken=jwt-x&openstadprojectid=2';
    const storageOne = new LocalStorage({ projectId: '1' });
    const storageTwo = new LocalStorage({ projectId: '2' });

    for (const [projectId, storage] of [
      ['1', storageOne],
      ['2', storageTwo],
    ]) {
      const pickup = consumeLoginTokenFromUrl({ search, projectId });
      if (pickup.jwt) {
        storage.set('openStadUser', { jwt: pickup.jwt });
      }
    }

    expect(storageOne.get('openStadUser')).toBeUndefined();
    expect(storageTwo.get('openStadUser')).toEqual({ jwt: 'jwt-x' });
  });
});

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
