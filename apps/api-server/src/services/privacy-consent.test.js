import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const { createPrivacyConsent } = require('./privacy-consent');

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
  const privacyConsentFor = createPrivacyConsent({
    settings,
    ttlMs: 1000,
    timeoutMs: 20,
    now: () => time,
  });
  return {
    privacyConsentFor,
    fetchClient,
    settings,
    advance: (ms) => {
      time += ms;
    },
  };
}

describe('privacyConsentFor', () => {
  it('reads the url, link text and consent label of the auth client', async () => {
    const { privacyConsentFor, settings } = setup({
      client: {
        config: {
          clientDisclaimerUrl: 'https://gemeente.nl/privacy',
          clientDisclaimerText: 'privacybeleid',
          requiredFields: {
            requiredUserFieldsLabels: {
              privacyConsent: 'Ik ga akkoord met het {link}',
            },
          },
        },
      },
    });

    expect(await privacyConsentFor(project)).toEqual({
      url: 'https://gemeente.nl/privacy',
      linkText: 'privacybeleid',
      label: 'Ik ga akkoord met het {link}',
    });
    expect(settings.config).toHaveBeenCalledWith({
      project,
      useAuth: 'default',
    });
  });

  it('drops a url that is not http or https', async () => {
    const { privacyConsentFor } = setup({
      client: { config: { clientDisclaimerUrl: 'javascript:alert(1)' } },
    });

    expect(await privacyConsentFor(project)).toEqual({
      url: '',
      linkText: '',
      label: '',
    });
  });

  it('returns nothing for a provider without a client', async () => {
    const { privacyConsentFor, fetchClient } = setup({ authConfig: {} });

    expect(await privacyConsentFor(project)).toBeNull();
    expect(fetchClient).not.toHaveBeenCalled();
  });

  it('logs a failing auth server and returns nothing', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { privacyConsentFor } = setup({
      error: new Error('Cannot connect to auth server'),
    });

    expect(await privacyConsentFor(project)).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      '[privacy-consent] loading the privacy statement failed: projectId=7 error=Cannot connect to auth server'
    );
    consoleError.mockRestore();
  });

  it('gives up on an auth server that does not answer', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { privacyConsentFor } = setup({ hang: true });

    expect(await privacyConsentFor(project)).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      '[privacy-consent] loading the privacy statement failed: projectId=7 error=no answer within 20ms'
    );
    consoleError.mockRestore();
  });

  it('caches the result per project until it expires', async () => {
    const { privacyConsentFor, fetchClient, advance } = setup({
      client: { config: { clientDisclaimerUrl: 'https://gemeente.nl/p' } },
    });

    await privacyConsentFor(project);
    await privacyConsentFor(project);
    expect(fetchClient).toHaveBeenCalledTimes(1);

    advance(1001);
    await privacyConsentFor(project);
    expect(fetchClient).toHaveBeenCalledTimes(2);
  });
});
