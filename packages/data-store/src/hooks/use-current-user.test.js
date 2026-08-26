import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { LocalStorage } from '../../../lib/local-storage';
import {
  consumeLoginToken,
  consumeLoginTokenFromUrl,
  pickInitialUser,
} from './use-current-user';

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
