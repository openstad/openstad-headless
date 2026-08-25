import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

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

describe('auth-settings jwtSecret invariant', () => {
  it('returns the global jwtSecret when the project does not override it', async () => {
    const authConfig = await authSettings.config({
      project: { id: 1, config: { auth: {} } },
    });

    expect(authConfig.jwtSecret).toBe('global-secret');
  });

  it('accepts a project jwtSecret equal to the global secret', async () => {
    const authConfig = await authSettings.config({
      project: { id: 1, config: { auth: { jwtSecret: 'global-secret' } } },
    });

    expect(authConfig.jwtSecret).toBe('global-secret');
  });

  it('fails hard when a project overrides the jwtSecret', async () => {
    await expect(
      authSettings.config({
        project: { id: 1, config: { auth: { jwtSecret: 'other-secret' } } },
      })
    ).rejects.toThrow(
      'Project 1 overrides config.auth.jwtSecret; per-project jwtSecret overrides are not supported'
    );
  });

  it('works without a project', async () => {
    const authConfig = await authSettings.config({ project: undefined });

    expect(authConfig.jwtSecret).toBe('global-secret');
  });
});
