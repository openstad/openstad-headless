import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const { createAuthClientSettings } = require('./auth-client-settings');

const project = { id: 7 };

function setup({
  authConfig = { clientId: 'abc' },
  client,
  error,
  hang = false,
} = {}) {
  const fetchClient = hang
    ? vi.fn(() => new Promise(() => {}))
    : error
      ? vi.fn().mockRejectedValue(error)
      : vi.fn().mockResolvedValue(client);
  const settings = {
    config: vi.fn().mockResolvedValue(authConfig),
    adapter: vi.fn().mockResolvedValue({ service: { fetchClient } }),
  };
  let time = 0;
  const authClientSettingsFor = createAuthClientSettings({
    settings,
    ttlMs: 1000,
    timeoutMs: 20,
    now: () => time,
  });
  return {
    authClientSettingsFor,
    fetchClient,
    settings,
    advance: (ms) => {
      time += ms;
    },
  };
}

describe('authClientSettingsFor', () => {
  it('reads the url, link text and consent label of the auth client', async () => {
    const { authClientSettingsFor, settings } = setup({
      client: {
        config: {
          clientDisclaimerUrl: 'https://gemeente.nl/privacy',
          clientDisclaimerText: 'privacybeleid',
          styling: { logo: 'https://gemeente.nl/logo.png' },
          requiredFields: {
            requiredUserFieldsLabels: {
              privacyConsent: 'Ik ga akkoord met het {link}',
            },
          },
        },
      },
    });

    expect(await authClientSettingsFor(project)).toEqual({
      url: 'https://gemeente.nl/privacy',
      linkText: 'privacybeleid',
      label: 'Ik ga akkoord met het {link}',
      logo: 'https://gemeente.nl/logo.png',
    });
    expect(settings.config).toHaveBeenCalledWith({
      project,
      useAuth: 'default',
    });
  });

  it('drops a url that is not http or https', async () => {
    const { authClientSettingsFor } = setup({
      client: {
        config: {
          clientDisclaimerUrl: 'javascript:alert(1)',
          styling: { logo: 'javascript:alert(1)' },
        },
      },
    });

    expect(await authClientSettingsFor(project)).toEqual({
      url: '',
      linkText: '',
      label: '',
      logo: '',
    });
  });

  it('returns nothing for a provider without a client', async () => {
    const { authClientSettingsFor, fetchClient } = setup({ authConfig: {} });

    expect(await authClientSettingsFor(project)).toBeNull();
    expect(fetchClient).not.toHaveBeenCalled();
  });

  it('logs a failing auth server and returns nothing', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { authClientSettingsFor } = setup({
      error: new Error('Cannot connect to auth server'),
    });

    expect(await authClientSettingsFor(project)).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      '[auth-client-settings] loading the authentication settings failed: projectId=7 error=Cannot connect to auth server'
    );
    consoleError.mockRestore();
  });

  it('gives up on an auth server that does not answer', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { authClientSettingsFor } = setup({ hang: true });

    expect(await authClientSettingsFor(project)).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      '[auth-client-settings] loading the authentication settings failed: projectId=7 error=no answer within 20ms'
    );
    consoleError.mockRestore();
  });

  it('caches the result per project until it expires', async () => {
    const { authClientSettingsFor, fetchClient, advance } = setup({
      client: { config: { clientDisclaimerUrl: 'https://gemeente.nl/p' } },
    });

    await authClientSettingsFor(project);
    await authClientSettingsFor(project);
    expect(fetchClient).toHaveBeenCalledTimes(1);

    advance(1001);
    await authClientSettingsFor(project);
    expect(fetchClient).toHaveBeenCalledTimes(2);
  });
});
