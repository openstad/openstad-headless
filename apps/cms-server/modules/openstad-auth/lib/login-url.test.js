import { describe, expect, test } from 'vitest';

const { loginUrlSuffix } = require('./login-url');

describe('loginUrlSuffix', () => {
  const project = { config: {} };

  test('marks a privileged login', () => {
    expect(loginUrlSuffix({ privileged: true, project, env: {} })).toBe(
      '&loginPriviliged=1'
    );
  });

  test('forces a new login without multi-project login', () => {
    expect(loginUrlSuffix({ privileged: false, project, env: {} })).toBe(
      '&forceNewLogin=1'
    );
  });

  test('reuses the shared session with multi-project login', () => {
    expect(
      loginUrlSuffix({
        privileged: false,
        project,
        env: { MULTI_PROJECT_LOGIN: 'true' },
      })
    ).toBe('');
  });

  test('follows the project setting', () => {
    expect(
      loginUrlSuffix({
        privileged: false,
        project: { config: { auth: { forceNewLoginOnWidgets: true } } },
        env: { MULTI_PROJECT_LOGIN: 'true' },
      })
    ).toBe('&forceNewLogin=1');
  });
});
