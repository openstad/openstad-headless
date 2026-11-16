import { mutate } from 'swr';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { LocalStorage } from '../../../lib/local-storage';
import {
  applyJwt,
  consumeLoginToken,
  consumeLoginTokenFromUrl,
  pickInitialUser,
} from './use-current-user';

let capturedFetcher;
vi.mock('swr', () => ({
  default: (_key, fetcher) => {
    capturedFetcher = fetcher;
    return { data: undefined, error: undefined, isLoading: true };
  },
  mutate: vi.fn(),
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal()),
  useEffect: () => {},
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

  function fakeLocation(search, hash = '') {
    return { pathname: '/page', search, hash };
  }

  function recordingHistory(sink) {
    return { replaceState: (state, title, url) => sink.push(url) };
  }

  test('only the target project namespace receives the token', () => {
    const location = fakeLocation(
      '?openstadlogintoken=jwt-x&openstadprojectid=2'
    );
    const replaced = [];
    const history = recordingHistory(replaced);
    const storageOne = new LocalStorage({ projectId: '1' });
    const storageTwo = new LocalStorage({ projectId: '2' });

    const resultOne = consumeLoginToken({
      storage: storageOne,
      projectId: '1',
      location,
      history,
    });
    const resultTwo = consumeLoginToken({
      storage: storageTwo,
      projectId: '2',
      location,
      history,
    });

    expect(resultOne).toBeNull();
    expect(resultTwo).toBe('jwt-x');
    expect(storageOne.get('openStadUser')).toBeUndefined();
    expect(storageTwo.get('openStadUser')).toEqual({ jwt: 'jwt-x' });
    expect(replaced).toEqual(['/page']);
  });

  test('leaves the url untouched for a widget of another project', () => {
    const replaced = [];
    const storage = new LocalStorage({ projectId: '1' });

    const result = consumeLoginToken({
      storage,
      projectId: '1',
      location: fakeLocation('?openstadlogintoken=jwt-x&openstadprojectid=2'),
      history: recordingHistory(replaced),
    });

    expect(result).toBeNull();
    expect(replaced).toEqual([]);
  });

  test('keeps unrelated params and the hash when rewriting the url', () => {
    const replaced = [];
    const storage = new LocalStorage({ projectId: '2' });

    consumeLoginToken({
      storage,
      projectId: '2',
      location: fakeLocation(
        '?foo=bar&openstadlogintoken=jwt-x&openstadprojectid=2',
        '#section'
      ),
      history: recordingHistory(replaced),
    });

    expect(replaced).toEqual(['/page?foo=bar#section']);
  });
});

describe('applyJwt', () => {
  let originalWindow;
  let stored;

  beforeEach(() => {
    originalWindow = global.window;
    stored = {};
    global.window = Object.assign(new EventTarget(), {
      localStorage: {
        getItem: (key) => (key in stored ? stored[key] : null),
        setItem: (key, value) => {
          stored[key] = String(value);
        },
        removeItem: (key) => {
          delete stored[key];
        },
      },
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  test('stores the jwt with its api url, uses it for requests and announces the change', () => {
    const api = { apiUrl: 'http://api.local' };
    const announced = vi.fn();
    window.addEventListener('osc-auth-changed', announced);

    applyJwt({
      storage: new LocalStorage({ projectId: 3 }),
      api,
      projectId: 3,
      jwt: 'jwt-3',
    });

    expect(JSON.parse(stored.openstad)['3'].openStadUser).toEqual({
      jwt: 'jwt-3',
      apiUrl: 'http://api.local',
    });
    expect(api.currentUserJWT).toBe('jwt-3');
    expect(mutate).toHaveBeenCalledWith({ type: 'current-user', projectId: 3 });
    expect(announced).toHaveBeenCalledTimes(1);
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

describe('useCurrentUser logout and cross-tab writes', () => {
  let originalWindow;
  let originalDocument;
  let originalHistory;

  const stored = () =>
    JSON.parse(global.window.localStorage.getItem('openstad'));

  function setup({ search = '', projects }) {
    global.history = { replaceState: vi.fn() };
    global.window = {
      location: {
        search,
        href: `https://example.com/${search}`,
        pathname: '/',
        hash: '',
      },
      history: global.history,
      localStorage: createLocalStorage({ openstad: JSON.stringify(projects) }),
    };
  }

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    originalHistory = global.history;
    global.document = { cookie: '' };
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    global.history = originalHistory;
    vi.restoreAllMocks();
  });

  test('openstadlogout clears every project with multi-project login', async () => {
    setup({
      search: '?openstadlogout=true',
      projects: {
        6: { openStadUser: { jwt: 'jwt-6' } },
        7: { openStadUser: { jwt: 'jwt-7' } },
      },
    });
    const api = { currentUserJWT: 'jwt-6', user: { fetchMe: vi.fn() } };

    await runGetCurrentUser(
      { projectId: 6, api, refresh: vi.fn() },
      { projectId: 6, multiProjectLogin: true }
    );

    expect(stored()).toEqual({});
  });

  test('openstadlogout reads the flag from the api config of the data store', async () => {
    setup({
      search: '?openstadlogout=true',
      projects: {
        6: { openStadUser: { jwt: 'jwt-6' } },
        7: { openStadUser: { jwt: 'jwt-7' } },
      },
    });
    const api = { currentUserJWT: 'jwt-6', user: { fetchMe: vi.fn() } };

    await runGetCurrentUser(
      { projectId: 6, api, refresh: vi.fn() },
      {
        projectId: 6,
        api: { url: 'http://api.local', multiProjectLogin: true },
      }
    );

    expect(stored()).toEqual({});
  });

  test('openstadlogout only clears its own project without multi-project login', async () => {
    setup({
      search: '?openstadlogout=true',
      projects: {
        6: { openStadUser: { jwt: 'jwt-6' } },
        7: { openStadUser: { jwt: 'jwt-7' } },
      },
    });
    const api = { currentUserJWT: 'jwt-6', user: { fetchMe: vi.fn() } };

    await runGetCurrentUser(
      { projectId: 6, api, refresh: vi.fn() },
      { projectId: 6 }
    );

    expect(stored()[6]).toEqual({});
    expect(stored()[7]).toEqual({ openStadUser: { jwt: 'jwt-7' } });
  });

  test('does not write a token back that was removed while /me was pending', async () => {
    setup({ projects: { 6: { openStadUser: { jwt: 'jwt-6' } } } });
    let resolveMe;
    const fetchMe = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveMe = resolve;
        })
    );
    const api = { currentUserJWT: null, user: { fetchMe } };

    const pending = runGetCurrentUser(
      { projectId: 6, api, refresh: vi.fn() },
      { projectId: 6, multiProjectLogin: true }
    );
    await vi.waitFor(() => expect(fetchMe).toHaveBeenCalled());
    global.window.localStorage.setItem('openstad', JSON.stringify({}));
    resolveMe({ id: 12, role: 'member' });

    await expect(pending).resolves.toEqual({});
    expect(stored()).toEqual({});
    expect(console.log).toHaveBeenCalledWith(
      '[osc-auth] token removed while fetching the user, continuing anonymous'
    );
  });

  test('keeps the token when it is still stored after /me', async () => {
    setup({ projects: { 6: { openStadUser: { jwt: 'jwt-6' } } } });
    const api = {
      currentUserJWT: null,
      apiUrl: 'http://api.local',
      user: { fetchMe: vi.fn().mockResolvedValue({ id: 12, role: 'member' }) },
    };

    await expect(
      runGetCurrentUser(
        { projectId: 6, api, refresh: vi.fn() },
        { projectId: 6, multiProjectLogin: true }
      )
    ).resolves.toEqual({ id: 12, role: 'member' });
    expect(stored()[6].openStadUser.jwt).toBe('jwt-6');
  });

  test('a logout signal cookie from the cms clears every project with multi-project login', async () => {
    setup({
      projects: {
        6: { openStadUser: { jwt: 'jwt-6' } },
        7: { openStadUser: { jwt: 'jwt-7' } },
      },
    });
    global.document = { cookie: 'openstad_logout=1' };
    const api = { currentUserJWT: 'jwt-6', user: { fetchMe: vi.fn() } };

    await expect(
      runGetCurrentUser(
        { projectId: 6, api, refresh: vi.fn() },
        { projectId: 6, multiProjectLogin: true }
      )
    ).resolves.toEqual({});

    expect(stored()).toEqual({});
    expect(api.user.fetchMe).not.toHaveBeenCalled();
    expect(global.document.cookie).toBe('openstad_logout=; path=/; max-age=0');
  });

  test('ignores the logout signal cookie without multi-project login', async () => {
    setup({ projects: { 6: { openStadUser: { jwt: 'jwt-6' } } } });
    global.document = { cookie: 'openstad_logout=1' };
    const api = {
      currentUserJWT: null,
      apiUrl: 'http://api.local',
      user: { fetchMe: vi.fn().mockResolvedValue({ id: 12, role: 'member' }) },
    };

    await runGetCurrentUser(
      { projectId: 6, api, refresh: vi.fn() },
      { projectId: 6 }
    );

    expect(stored()[6].openStadUser.jwt).toBe('jwt-6');
    expect(global.document.cookie).toBe('openstad_logout=1');
  });

  test('a fresh login token in the url wins over an earlier logout signal cookie', async () => {
    setup({
      search: '?openstadlogintoken=jwt-new&openstadprojectid=6',
      projects: { 7: { openStadUser: { jwt: 'jwt-7' } } },
    });
    global.document = { cookie: 'openstad_logout=1' };
    const api = {
      currentUserJWT: null,
      apiUrl: 'http://api.local',
      user: { fetchMe: vi.fn().mockResolvedValue({ id: 12, role: 'member' }) },
    };

    await expect(
      runGetCurrentUser(
        { projectId: 6, api, refresh: vi.fn() },
        { projectId: 6, multiProjectLogin: true }
      )
    ).resolves.toEqual({ id: 12, role: 'member' });

    expect(stored()[6].openStadUser.jwt).toBe('jwt-new');
    expect(global.document.cookie).toBe('openstad_logout=; path=/; max-age=0');
  });

  test('keeps a login from the url when an old cms user is cleared during the same load', async () => {
    setup({
      search: '?openstadlogintoken=jwt-url&openstadprojectid=6',
      projects: { 6: { cmsUser: { access_token: 'old-cms-token' } } },
    });
    const api = {
      currentUserJWT: null,
      apiUrl: 'http://api.local',
      user: { fetchMe: vi.fn().mockResolvedValue({ id: 12, role: 'member' }) },
    };

    await expect(
      runGetCurrentUser(
        { projectId: 6, api, refresh: vi.fn() },
        { projectId: 6, multiProjectLogin: true }
      )
    ).resolves.toEqual({ id: 12, role: 'member' });
  });
});
