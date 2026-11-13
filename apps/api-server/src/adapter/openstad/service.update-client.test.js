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

const project = { id: 1, name: 'Test', config: {} };

const storedClient = {
  authTypes: ['Url'],
  requiredUserFields: [],
  twoFactorRoles: [],
  config: {
    fromEmail: 'old@example.nl',
    clientDisclaimerUrl: 'https://example.nl/old-privacy',
    clientDisclaimerText: 'Oude privacyverklaring',
  },
};

function stubAuthServer() {
  const posted = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options = {}) => {
      if (options.method === 'post') {
        posted.push(JSON.parse(options.body));
        return { ok: true };
      }
      return { ok: true, json: async () => structuredClone(storedClient) };
    })
  );
  return posted;
}

function authConfigWith(config) {
  return {
    clientId: 'c',
    clientSecret: 's',
    serverUrlInternal: 'http://auth',
    config,
  };
}

describe('service.updateClient privacy statement', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('clears the privacy statement url and text when they are emptied', async () => {
    const posted = stubAuthServer();

    await service.updateClient({
      authConfig: authConfigWith({
        clientDisclaimerUrl: '',
        clientDisclaimerText: '',
      }),
      project,
    });

    expect(posted[0].config.clientDisclaimerUrl).toBe('');
    expect(posted[0].config.clientDisclaimerText).toBe('');
  });

  it('keeps the stored privacy statement when the update does not mention it', async () => {
    const posted = stubAuthServer();

    await service.updateClient({ authConfig: authConfigWith({}), project });

    expect(posted[0].config.clientDisclaimerUrl).toBe(
      'https://example.nl/old-privacy'
    );
    expect(posted[0].config.clientDisclaimerText).toBe(
      'Oude privacyverklaring'
    );
  });

  it('keeps other stored settings when they are sent empty', async () => {
    const posted = stubAuthServer();

    await service.updateClient({
      authConfig: authConfigWith({ fromEmail: '' }),
      project,
    });

    expect(posted[0].config.fromEmail).toBe('old@example.nl');
  });
});
