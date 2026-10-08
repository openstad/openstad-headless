import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const nodeRequire = createRequire(import.meta.url);

process.env.NODE_CONFIG = JSON.stringify({
  auth: { jwtSecret: 'global-secret' },
});
delete nodeRequire.cache[nodeRequire.resolve('config')];

const { assertNoJwtSecretOverrides, findProjectsWithJwtSecretOverride } =
  await import('./validateProjectAuthConfig.js');

const project = (id, jwtSecret) => ({
  id,
  config: jwtSecret ? { auth: { jwtSecret } } : { auth: {} },
});

const dbWith = (projects) => ({
  Project: { findAll: vi.fn().mockResolvedValue(projects) },
});

describe('findProjectsWithJwtSecretOverride', () => {
  it('returns no projects when none override the secret', async () => {
    const db = dbWith([project(1), project(2, 'global-secret')]);

    await expect(findProjectsWithJwtSecretOverride(db)).resolves.toEqual([]);
  });

  it('returns the ids of every offending project', async () => {
    const db = dbWith([
      project(1),
      project(2, 'other-secret'),
      project(3, 'global-secret'),
      project(4, 'yet-another'),
    ]);

    await expect(findProjectsWithJwtSecretOverride(db)).resolves.toEqual([
      2, 4,
    ]);
  });
});

describe('assertNoJwtSecretOverrides', () => {
  it('resolves when no project overrides the secret', async () => {
    await expect(
      assertNoJwtSecretOverrides(dbWith([project(1)]))
    ).resolves.toBeUndefined();
  });

  it('rejects naming the offending projects', async () => {
    const db = dbWith([project(2, 'other-secret'), project(4, 'yet-another')]);

    await expect(assertNoJwtSecretOverrides(db)).rejects.toThrow(
      'Project(s) 2, 4 override config.auth.jwtSecret'
    );
  });

  it('propagates a database error instead of reporting a clean config', async () => {
    const db = {
      Project: { findAll: vi.fn().mockRejectedValue(new Error('db down')) },
    };

    await expect(assertNoJwtSecretOverrides(db)).rejects.toThrow('db down');
  });
});
