import { describe, expect, test } from 'vitest';

import API from './index';

describe('API instance per project', () => {
  test('gives widgets of different projects their own api instance', () => {
    const projectTwo = new API({ apiUrl: 'http://api.local', projectId: 2 });
    const projectThree = new API({ apiUrl: 'http://api.local', projectId: 3 });

    expect(projectThree).not.toBe(projectTwo);
    projectTwo.currentUserJWT = 'jwt-project-2';
    expect(projectThree.currentUserJWT).toBeUndefined();
  });

  test('reuses the instance for the same project across renders', () => {
    const first = new API({ apiUrl: 'http://api.local', projectId: 4 });
    const second = new API({ api: { url: 'http://api.local' }, projectId: 4 });

    expect(second).toBe(first);
  });

  test('keeps installations apart', () => {
    expect(new API({ apiUrl: 'http://a.local', projectId: 5 })).not.toBe(
      new API({ apiUrl: 'http://b.local', projectId: 5 })
    );
  });
});
