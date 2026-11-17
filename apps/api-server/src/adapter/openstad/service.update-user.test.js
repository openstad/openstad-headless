import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const service = require('./service');

const authConfig = {
  clientId: 'c',
  clientSecret: 's',
  serverUrlInternal: 'http://auth',
};

describe('service.updateUser errors', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the status of a refusal by the auth server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 403 }))
    );

    await expect(
      service.updateUser({ authConfig, userData: { id: 1, email: 'x' } })
    ).rejects.toMatchObject({ status: 403 });
  });

  it('reports a connection problem without a status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED');
      })
    );

    await expect(
      service.updateUser({ authConfig, userData: { id: 1 } })
    ).rejects.toThrow('Cannot connect to auth server');
  });
});
