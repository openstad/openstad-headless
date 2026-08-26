import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const nodeRequire = createRequire(import.meta.url);

process.env.NODE_CONFIG = JSON.stringify({
  auth: {
    jwtSecret: 'global-secret',
    provider: {
      openstad: { adapter: 'openstad' },
    },
    adapter: {
      openstad: {},
    },
  },
});
delete nodeRequire.cache[nodeRequire.resolve('config')];

const authSettings = (await import('./auth-settings.js')).default;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('hasJwtSecretOverride', () => {
  it('is false when the project does not set a jwtSecret', () => {
    expect(
      authSettings.hasJwtSecretOverride({ id: 1, config: { auth: {} } })
    ).toBe(false);
    expect(authSettings.hasJwtSecretOverride({ id: 1, config: {} })).toBe(
      false
    );
    expect(authSettings.hasJwtSecretOverride(undefined)).toBe(false);
  });

  it('is false when the project secret equals the global one', () => {
    expect(
      authSettings.hasJwtSecretOverride({
        id: 1,
        config: { auth: { jwtSecret: 'global-secret' } },
      })
    ).toBe(false);
  });

  it('is true when the project overrides the global secret', () => {
    expect(
      authSettings.hasJwtSecretOverride({
        id: 1,
        config: { auth: { jwtSecret: 'other-secret' } },
      })
    ).toBe(true);
  });

  it('catches an override hidden under a provider', () => {
    expect(
      authSettings.hasJwtSecretOverride({
        id: 1,
        config: {
          auth: { provider: { openstad: { jwtSecret: 'evil' } } },
        },
      })
    ).toBe(true);
  });

  it('catches an override hidden under an adapter', () => {
    expect(
      authSettings.hasJwtSecretOverride({
        id: 1,
        config: {
          auth: { adapter: { openstad: { jwtSecret: 'evil' } } },
        },
      })
    ).toBe(true);
  });

  it('catches an empty-string override that would still win the merge', () => {
    expect(
      authSettings.hasJwtSecretOverride({
        id: 1,
        config: { auth: { jwtSecret: '' } },
      })
    ).toBe(true);
  });

  it('accepts nested secrets equal to the global one', () => {
    expect(
      authSettings.hasJwtSecretOverride({
        id: 1,
        config: {
          auth: {
            jwtSecret: 'global-secret',
            provider: { openstad: { jwtSecret: 'global-secret' } },
          },
        },
      })
    ).toBe(false);
  });
});

describe('auth-settings config', () => {
  it('returns the global jwtSecret when the project does not override it', async () => {
    const authConfig = await authSettings.config({
      project: { id: 1, config: { auth: {} } },
    });

    expect(authConfig.jwtSecret).toBe('global-secret');
  });

  it('works without a project', async () => {
    const authConfig = await authSettings.config({ project: undefined });

    expect(authConfig.jwtSecret).toBe('global-secret');
  });

  it('does not throw on an overriding project, so a request cannot crash the process', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      authSettings.config({
        project: { id: 4242, config: { auth: { jwtSecret: 'other-secret' } } },
      })
    ).resolves.toBeDefined();

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('project 4242 overrides config.auth.jwtSecret')
    );
  });

  it('reports an overriding project only once', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const project = {
      id: 4343,
      config: { auth: { jwtSecret: 'other-secret' } },
    };

    await authSettings.config({ project });
    await authSettings.config({ project });

    expect(error).toHaveBeenCalledTimes(1);
  });
});
