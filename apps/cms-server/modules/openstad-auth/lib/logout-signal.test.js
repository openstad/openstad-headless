import { describe, expect, test, vi } from 'vitest';

const { markLogoutForWidgets } = require('./logout-signal');

describe('markLogoutForWidgets', () => {
  test('sets a short-lived cookie the widgets can read', () => {
    const res = { cookie: vi.fn() };
    markLogoutForWidgets(res, {
      secure: true,
      env: { MULTI_PROJECT_LOGIN: 'true' },
    });

    expect(res.cookie).toHaveBeenCalledWith('openstad_logout', '1', {
      path: '/',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
      httpOnly: false,
      secure: true,
    });
  });

  test('does nothing without multi-project login', () => {
    const res = { cookie: vi.fn() };
    markLogoutForWidgets(res, { secure: false, env: {} });
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
