import { describe, expect, test, vi } from 'vitest';

const { policyUrl, consentField, recordConsent } = require('./privacyConsent');

function clientWith(overrides = {}, config = {}) {
  return {
    id: 7,
    clientId: 'abc',
    ...overrides,
    config: {
      clientDisclaimerUrl: 'https://example.nl/privacy',
      ...config,
    },
  };
}

describe('policyUrl', () => {
  test('returns a valid https policy URL', () => {
    expect(policyUrl(clientWith())).toBe('https://example.nl/privacy');
  });

  test('returns nothing when no policy URL is set', () => {
    expect(policyUrl(clientWith({}, { clientDisclaimerUrl: '' }))).toBe('');
  });

  test('drops javascript: policy URLs', () => {
    expect(
      policyUrl(clientWith({}, { clientDisclaimerUrl: 'javascript:alert(1)' }))
    ).toBe('');
  });

  test('quote injection in the policy URL is percent-encoded by new URL()', () => {
    const url = policyUrl(
      clientWith(
        {},
        { clientDisclaimerUrl: 'https://example.nl/x?"onmouseover="alert(1)' }
      )
    );
    expect(url).not.toContain('"onmouseover="');
    expect(url.startsWith('https://example.nl/')).toBe(true);
  });
});

describe('consentField', () => {
  test('is not shown without a valid policy URL', () => {
    expect(consentField(clientWith({}, { clientDisclaimerUrl: '' }))).toBe(
      null
    );
  });

  test('uses the default label with a lowercased link text', () => {
    const field = consentField(
      clientWith({}, { clientDisclaimerText: 'Privacyverklaring' })
    );
    expect(field).toEqual({
      url: 'https://example.nl/privacy',
      linkText: 'privacyverklaring',
      hasLink: true,
      labelPrefix:
        'Ik ga akkoord met de verwerking van mijn persoonsgegevens conform de ',
      labelSuffix: '',
    });
  });

  test('uses the label stored in the client config', () => {
    const field = consentField(
      clientWith(
        {},
        {
          requiredFields: {
            requiredUserFieldsLabels: {
              privacyConsent: 'Ik lees de {link} van de gemeente.',
            },
          },
        }
      )
    );
    expect(field.labelPrefix).toBe('Ik lees de ');
    expect(field.labelSuffix).toBe(' van de gemeente.');
    expect(field.hasLink).toBe(true);
  });

  test('shows a stored label without {link} as plain text', () => {
    const field = consentField(
      clientWith(
        {},
        {
          requiredFields: {
            requiredUserFieldsLabels: { privacyConsent: 'Ik ga akkoord.' },
          },
        }
      )
    );
    expect(field.labelPrefix).toBe('Ik ga akkoord.');
    expect(field.hasLink).toBe(false);
  });

  test('keeps an ampersand readable instead of escaping it twice', () => {
    const field = consentField(
      clientWith(
        {},
        {
          clientDisclaimerText: 'Privacy & cookies',
          requiredFields: {
            requiredUserFieldsLabels: {
              privacyConsent:
                'Ik ga akkoord met de privacy- & cookieverklaring {link}',
            },
          },
        }
      )
    );
    expect(field.labelPrefix).toBe(
      'Ik ga akkoord met de privacy- & cookieverklaring '
    );
    expect(field.linkText).toBe('privacy & cookies');
  });

  test('script tags in the link text are stripped', () => {
    const field = consentField(
      clientWith(
        {},
        { clientDisclaimerText: '<script>alert(1)</script>privacyverklaring' }
      )
    );
    expect(field.linkText).not.toContain('<script>');
  });
});

describe('recordConsent', () => {
  test('stores the consent moment for this client', async () => {
    const user = { privacyConsentAt: { 3: '2026-01-01T00:00:00.000Z' } };
    user.update = vi.fn(async () => user);

    await recordConsent(user, clientWith());

    const saved = user.update.mock.calls[0][0].privacyConsentAt;
    expect(saved[3]).toBe('2026-01-01T00:00:00.000Z');
    expect(typeof saved[7]).toBe('string');
  });

  test('keeps an earlier consent moment for this client', async () => {
    const user = { privacyConsentAt: { 7: '2026-01-01T00:00:00.000Z' } };
    user.update = vi.fn(async () => user);

    await recordConsent(user, clientWith());

    expect(user.update).not.toHaveBeenCalled();
  });
});
