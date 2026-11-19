import { describe, expect, test } from 'vitest';

const { shouldForceNewLoginByDefault } = require('./force-new-login');

describe('shouldForceNewLoginByDefault', () => {
  test('forces a new login without multi-project login', () => {
    expect(shouldForceNewLoginByDefault({ config: {} }, {})).toBe(true);
  });

  test('keeps the shared session with multi-project login', () => {
    expect(
      shouldForceNewLoginByDefault(
        { config: {} },
        { MULTI_PROJECT_LOGIN: 'true' }
      )
    ).toBe(false);
  });

  test('lets the project setting win', () => {
    const forced = { config: { auth: { forceNewLoginOnWidgets: true } } };
    const shared = { config: { auth: { forceNewLoginOnWidgets: false } } };
    expect(
      shouldForceNewLoginByDefault(forced, { MULTI_PROJECT_LOGIN: 'true' })
    ).toBe(true);
    expect(shouldForceNewLoginByDefault(shared, {})).toBe(false);
  });
});
