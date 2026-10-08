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
  clientId: 'target-client',
  clientSecret: 'secret',
  serverUrlInternal: 'http://auth.local',
};

const reply = (status, body) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.restoreAllMocks());

describe('service.loginWithUniqueCode', () => {
  it('posts the code and end-user ip with basic auth and returns status and body', async () => {
    const fetchSpy = reply(404, { error: 'invalid_code' });

    const result = await service.loginWithUniqueCode({
      authConfig,
      code: 'ABC',
      ip: '1.2.3.4',
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://auth.local/api/admin/unique-code-login');
    expect(options.headers.Authorization).toMatch(/^Basic /);
    expect(JSON.parse(options.body)).toEqual({ code: 'ABC', ip: '1.2.3.4' });
    expect(result).toEqual({ status: 404, data: { error: 'invalid_code' } });
  });
});

describe('service.fetchUniqueCodesForUser', () => {
  it('filters on the client and user', async () => {
    const fetchSpy = reply(200, { total: 1, data: [{ id: 3 }] });

    const result = await service.fetchUniqueCodesForUser({
      authConfig,
      userId: 42,
    });

    expect(fetchSpy.mock.calls[0][0]).toBe(
      'http://auth.local/api/admin/unique-codes?clientId=target-client&userId=42&limit=1'
    );
    expect(result.total).toBe(1);
  });

  it('throws with the status when the auth server refuses', async () => {
    reply(403, {});

    await expect(
      service.fetchUniqueCodesForUser({ authConfig, userId: 42 })
    ).rejects.toThrow('status 403');
  });
});

describe('service.validateAccessCode', () => {
  it('is true when the auth server knows the code', async () => {
    reply(200, { data: 'CODE1' });
    expect(
      await service.validateAccessCode({ authConfig, code: 'CODE1' })
    ).toBe(true);
  });

  it('is false when the auth server does not know the code', async () => {
    reply(200, { data: null });
    expect(await service.validateAccessCode({ authConfig, code: 'NOPE' })).toBe(
      false
    );
  });
});
