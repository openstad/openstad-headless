import { mutate } from 'swr';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { LocalStorage } from '../../../lib/local-storage';
import {
  applyJwt,
  consumeLoginToken,
  consumeLoginTokenFromUrl,
  pickInitialUser,
  refreshCurrentUser,
  refreshCurrentUserOnAuthChange,
  removeExpireOnCloseFromUrl,
  revokeKnownLogins,
} from './use-current-user';

let capturedFetcher;
let swrData;
vi.mock('swr', () => ({
  default: (_key, fetcher) => {
    capturedFetcher = fetcher;
    return { data: swrData, error: undefined, isLoading: true };
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

const API_URL = 'http://api.local';

function unexpiredJwt(name) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256' })}.${encode({ exp, name })}.sig`;
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

describe('removeExpireOnCloseFromUrl', () => {
  test('keeps the login token when expireOnClose is the first parameter', () => {
    expect(
      removeExpireOnCloseFromUrl(
        'http://x/w.html?expireOnClose=1&openstadlogintoken=jwt-x&openstadprojectid=3'
      )
    ).toBe('http://x/w.html?openstadlogintoken=jwt-x&openstadprojectid=3');
  });

  test('removes a trailing expireOnClose', () => {
    expect(
      removeExpireOnCloseFromUrl('http://x/w.html?a=1&expireOnClose=1')
    ).toBe('http://x/w.html?a=1');
  });

  test('keeps the hash and leaves a url without the parameter alone', () => {
    expect(removeExpireOnCloseFromUrl('http://x/w.html?a=1#top')).toBe(
      'http://x/w.html?a=1#top'
    );
  });

  test('leaves the login token readable after removing expireOnClose', () => {
    const cleaned = new URL(
      removeExpireOnCloseFromUrl(
        'http://x/w.html?expireOnClose=1&openstadlogintoken=jwt-x&openstadprojectid=3'
      )
    );

    const result = consumeLoginTokenFromUrl({
      search: cleaned.search,
      projectId: 3,
    });

    expect(result.jwt).toBe('jwt-x');
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

  test('stores the jwt with its api url, uses it for requests and announces the change for its project', async () => {
    const api = { apiUrl: 'http://api.local' };
    const announced = vi.fn();
    window.addEventListener('osc-auth-changed', announced);

    applyJwt({
      storage: new LocalStorage({ projectId: 3 }),
      api,
      projectId: 3,
      jwt: 'jwt-3',
    });
    await Promise.resolve();

    expect(JSON.parse(stored.openstad)['3'].openStadUser).toEqual({
      jwt: 'jwt-3',
      apiUrl: 'http://api.local',
    });
    expect(api.currentUserJWT).toBe('jwt-3');
    expect(mutate).toHaveBeenCalledWith({ type: 'current-user', projectId: 3 });
    expect(announced).toHaveBeenCalledTimes(1);
    expect(announced.mock.calls[0][0].detail).toEqual({ projectIds: ['3'] });
  });
});

describe('refreshing the current user after an auth change', () => {
  beforeEach(() => {
    mutate.mockClear();
  });

  test('fetches the user of a project once for all requests in the same tick', async () => {
    refreshCurrentUser(6);
    refreshCurrentUser(6);
    refreshCurrentUser(7);

    expect(mutate).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(mutate.mock.calls).toEqual([
      [{ type: 'current-user', projectId: 6 }],
      [{ type: 'current-user', projectId: 7 }],
    ]);

    refreshCurrentUser(6);
    await Promise.resolve();
    expect(mutate).toHaveBeenCalledTimes(3);
  });

  test('only refreshes when the change concerns its own project or is not specified', async () => {
    const onAuthChangeFor6 = refreshCurrentUserOnAuthChange(6);

    onAuthChangeFor6(['7']);
    await Promise.resolve();
    expect(mutate).not.toHaveBeenCalled();

    onAuthChangeFor6(['6', '7']);
    await Promise.resolve();
    onAuthChangeFor6(null);
    await Promise.resolve();
    expect(mutate.mock.calls).toEqual([
      [{ type: 'current-user', projectId: 6 }],
      [{ type: 'current-user', projectId: 6 }],
    ]);
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
    delete global.globalOpenStadUser;
    vi.restoreAllMocks();
  });

  function cmsRenderedLogin(projectId) {
    global.globalOpenStadUser = { id: 12, jwt: 'jwt-cms', projectId };
    return {
      currentUserJWT: null,
      apiUrl: API_URL,
      user: { fetchMe: vi.fn().mockResolvedValue({ id: 12, role: 'member' }) },
    };
  }

  test('uses the login rendered by the cms on the first load with multi-project login', async () => {
    setup({ projects: {} });
    const api = cmsRenderedLogin(21);

    await expect(
      runGetCurrentUser(
        { projectId: 21, api, refresh: vi.fn() },
        { projectId: 21, multiProjectLogin: true }
      )
    ).resolves.toEqual({ id: 12, role: 'member' });
    expect(stored()[21].openStadUser.jwt).toBe('jwt-cms');
  });

  test('does not write the login rendered by the cms back after a logout in another tab with multi-project login', async () => {
    setup({ projects: {} });
    const api = cmsRenderedLogin(22);
    const store = { projectId: 22, api, refresh: vi.fn() };
    const props = { projectId: 22, multiProjectLogin: true };

    await runGetCurrentUser(store, props);
    global.window.localStorage.setItem('openstad', JSON.stringify({}));

    await expect(runGetCurrentUser(store, props)).resolves.toEqual({});
    expect(stored()[22]?.openStadUser).toBeUndefined();
    expect(api.user.fetchMe).toHaveBeenCalledTimes(1);
  });

  test('still writes the login rendered by the cms back after a logout in another tab without multi-project login', async () => {
    setup({ projects: {} });
    const api = cmsRenderedLogin(23);
    const store = { projectId: 23, api, refresh: vi.fn() };
    const props = { projectId: 23 };

    await runGetCurrentUser(store, props);
    global.window.localStorage.setItem('openstad', JSON.stringify({}));

    await expect(runGetCurrentUser(store, props)).resolves.toEqual({
      id: 12,
      role: 'member',
    });
    expect(stored()[23].openStadUser.jwt).toBe('jwt-cms');
    expect(api.user.fetchMe).toHaveBeenCalledTimes(2);
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

describe('revokeKnownLogins', () => {
  let originalWindow;
  let originalDocument;
  let originalFetch;

  function storeLogins(projects) {
    global.window = {
      localStorage: createLocalStorage({ openstad: JSON.stringify(projects) }),
    };
  }

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    originalFetch = global.fetch;
    global.document = { cookie: '' };
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  test('revokes the login of every stored project on the same api', async () => {
    const jwt6 = unexpiredJwt('6');
    const jwt7 = unexpiredJwt('7');
    storeLogins({
      6: { openStadUser: { jwt: jwt6, apiUrl: API_URL } },
      7: { openStadUser: { jwt: jwt7, apiUrl: API_URL } },
      8: {
        openStadUser: { jwt: unexpiredJwt('8'), apiUrl: 'http://other.api' },
      },
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    await revokeKnownLogins({ apiUrl: API_URL });

    expect(global.fetch.mock.calls).toEqual([
      [
        `${API_URL}/auth/project/6/logout`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${jwt6}` },
          keepalive: true,
        },
      ],
      [
        `${API_URL}/auth/project/7/logout`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${jwt7}` },
          keepalive: true,
        },
      ],
    ]);
  });

  test('ignores revocations that fail', async () => {
    storeLogins({
      6: { openStadUser: { jwt: unexpiredJwt('6'), apiUrl: API_URL } },
    });
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await revokeKnownLogins({ apiUrl: API_URL });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('stops waiting for revocations after three seconds', async () => {
    vi.useFakeTimers();
    storeLogins({
      6: { openStadUser: { jwt: unexpiredJwt('6'), apiUrl: API_URL } },
    });
    global.fetch = vi.fn(() => new Promise(() => {}));
    const done = vi.fn();

    revokeKnownLogins({ apiUrl: API_URL }).then(done);
    await vi.advanceTimersByTimeAsync(2999);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalledTimes(1);
  });
});

describe('useCurrentUser logout', () => {
  let originalWindow;
  let originalDocument;
  let originalFetch;
  const jwt6 = unexpiredJwt('6');

  const stored = () =>
    JSON.parse(global.window.localStorage.getItem('openstad'));

  function renderWithUser(props) {
    const order = [];
    global.fetch = vi.fn(async () => {
      order.push('revoke');
      return { ok: true };
    });
    const api = {
      apiUrl: API_URL,
      user: { logout: vi.fn(() => order.push('navigate')) },
    };
    const { data } = useCurrentUser.call(
      { projectId: 6, api, refresh: vi.fn() },
      props
    );
    return { data, api, order };
  }

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    originalFetch = global.fetch;
    global.window = {
      location: { search: '', href: 'https://example.com/' },
      localStorage: createLocalStorage({
        openstad: JSON.stringify({
          6: { openStadUser: { jwt: jwt6, apiUrl: API_URL } },
        }),
      }),
    };
    global.document = { cookie: '' };
    swrData = { id: 12 };
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    global.fetch = originalFetch;
    swrData = undefined;
  });

  test('revokes the stored logins before clearing storage and navigating with multi-project login', async () => {
    const { data, api, order } = renderWithUser({
      projectId: 6,
      multiProjectLogin: true,
    });

    await data.logout({ url: 'https://example.com/after' });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/project/6/logout`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt6}` },
        keepalive: true,
      }
    );
    expect(order).toEqual(['revoke', 'navigate']);
    expect(api.user.logout).toHaveBeenCalledWith({
      url: 'https://example.com/after',
    });
    expect(stored()).toEqual({});
  });

  test('logs out without revoking without multi-project login', async () => {
    const { data, api } = renderWithUser({ projectId: 6 });

    await data.logout({ url: 'https://example.com/after' });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(api.user.logout).toHaveBeenCalledWith({
      url: 'https://example.com/after',
    });
    expect(stored()).toEqual({});
  });
});
