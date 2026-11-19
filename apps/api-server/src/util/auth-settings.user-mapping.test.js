import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const authSettings = require('./auth-settings');
const mapUserData = require('./map-user-data');

const user = {
  id: 7,
  name: ' Jan ',
  email: 'a@b.nl',
  role: 'member',
  nick: 'N',
};
const resolve = async (userMapping, provider = 'openstad') => {
  const project = {
    config: { auth: { provider: { [provider]: { userMapping } } } },
  };
  const cfg = await authSettings.config({ project, useAuth: provider });
  return mapUserData({ map: cfg.userMapping, user });
};

afterEach(() => vi.restoreAllMocks());

describe('project userMapping', () => {
  it('does not execute function strings from project config', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.HOSTNAME_PROBE = 'pwned';
    const res = await resolve(
      JSON.stringify({ name: "user => 'X' + process.env.HOSTNAME_PROBE" })
    );
    expect(res.name).toBe('Jan'); // default mapping applies
    const logs = console.warn.mock.calls.map((c) => c[0]).join('\n');
    expect(logs).toContain('ignoring invalid project userMapping');
    expect(logs).not.toContain('HOSTNAME_PROBE');
  });

  it('does not execute function strings on the anonymous provider', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await resolve({ name: 'user => 1' }, 'anonymous');
    expect(res.name).toBe('Jan'); // adapter default applies
  });

  it('honours a plain property name without eval', async () => {
    const res = await resolve({ name: 'nick', email: 'process' });
    expect(res.name).toBe('N');
    expect(res.email).toBeUndefined(); // user.process, not the global
  });

  it('keeps default mapping for name, email and role', async () => {
    const cfg = await authSettings.config({ project: {}, useAuth: 'openstad' });
    const res = mapUserData({ map: cfg.userMapping, user });
    expect(res.name).toBe('Jan');
    expect(res.email).toBe('a@b.nl');
    expect(res.role).toBe('member');
  });
});
