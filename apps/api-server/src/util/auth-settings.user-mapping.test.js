import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const authSettings = require('./auth-settings');
const mapUserData = require('./map-user-data');

const user = { id: 7, name: ' Jan ', email: 'a@b.nl', role: 'member' };
const resolve = async (userMapping, provider = 'openstad') => {
  const project = {
    config: { auth: { provider: { [provider]: { userMapping } } } },
  };
  const cfg = await authSettings.config({ project, useAuth: provider });
  return mapUserData({ map: cfg.userMapping, user });
};

describe('project userMapping', () => {
  it('ignores userMapping from project config', async () => {
    process.env.HOSTNAME_PROBE = 'pwned';
    const res = await resolve(
      JSON.stringify({ name: "user => 'X' + process.env.HOSTNAME_PROBE" })
    );
    expect(res.name).toBe('Jan');
  });

  it('ignores userMapping on the anonymous provider', async () => {
    const res = await resolve({ name: 'user => 1' }, 'anonymous');
    expect(res.name).toBe('Jan');
  });

  it('does not mutate the stored project config', async () => {
    const project = {
      config: {
        auth: { provider: { openstad: { userMapping: { name: 'x' } } } },
      },
    };
    await authSettings.config({ project, useAuth: 'openstad' });
    expect(project.config.auth.provider.openstad.userMapping).toEqual({
      name: 'x',
    });
  });

  it('keeps default mapping for name, email and role', async () => {
    const cfg = await authSettings.config({ project: {}, useAuth: 'openstad' });
    const res = mapUserData({ map: cfg.userMapping, user });
    expect(res.name).toBe('Jan');
    expect(res.email).toBe('a@b.nl');
    expect(res.role).toBe('member');
  });
});
