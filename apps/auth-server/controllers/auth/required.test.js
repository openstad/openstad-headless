import { describe, expect, test } from 'vitest';

const required = require('./required');

function renderWith(clientOverrides = {}) {
  let rendered;
  const req = {
    client: {
      id: 1,
      clientId: 'abc',
      requiredUserFields: ['privacyConsent'],
      config: {
        requiredFields: {
          requiredUserFieldsLabels: {
            privacyConsent: 'Ik ga akkoord met de {link}',
          },
        },
      },
      ...clientOverrides,
    },
    user: {},
    query: {},
  };
  const res = {
    render: (view, locals) => {
      rendered = { view, locals };
    },
  };
  required.index(req, res, () => {});
  return rendered;
}

function consentField(rendered) {
  return rendered.locals.requiredFields.find((f) => f.key === 'privacyConsent');
}

describe('required-fields privacy consent label', () => {
  test('exposes a valid https policy URL plus prefix/text for the template', () => {
    const field = consentField(
      renderWith({ clientDisclaimerUrl: 'https://example.nl/privacy' })
    );
    expect(field.privacyUrl).toBe('https://example.nl/privacy');
    expect(field.labelPrefix).toBe('Ik ga akkoord met de ');
    expect(field.labelSuffix).toBe('');
    expect(field.privacyText).toBeTruthy();
  });

  test('drops javascript: policy URLs and leaves only plain text', () => {
    const field = consentField(
      renderWith({ clientDisclaimerUrl: 'javascript:alert(1)' })
    );
    expect(field.privacyUrl).toBe('');
    expect(field.privacyText).toBeTruthy();
  });

  test('quote injection in the policy URL is percent-encoded by new URL()', () => {
    const field = consentField(
      renderWith({
        clientDisclaimerUrl: 'https://example.nl/x?"onmouseover="alert(1)',
      })
    );
    expect(field.privacyUrl).not.toContain('"onmouseover="');
    expect(field.privacyUrl.startsWith('https://example.nl/')).toBe(true);
  });

  test('script tags in the disclaimer text are stripped', () => {
    const field = consentField(
      renderWith({
        clientDisclaimerUrl: 'https://example.nl/privacy',
        clientDisclaimerText: '<script>alert(1)</script>privacyverklaring',
      })
    );
    expect(field.privacyText).not.toContain('<script>');
  });
});
