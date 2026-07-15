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

function consentLabel(rendered) {
  const field = rendered.locals.requiredFields.find(
    (f) => f.key === 'privacyConsent'
  );
  return field ? field.label : undefined;
}

describe('required-fields privacy consent label', () => {
  test('builds an anchor for a valid https policy URL', () => {
    const label = consentLabel(
      renderWith({ clientDisclaimerUrl: 'https://example.nl/privacy' })
    );
    expect(label).toContain('<a href="https://example.nl/privacy"');
    expect(label).toContain('target="_blank"');
    expect(label).toContain('rel="noreferrer noopener"');
    expect(label).toContain('aria-label=');
  });

  test('drops javascript: policy URLs and falls back to plain text', () => {
    const label = consentLabel(
      renderWith({ clientDisclaimerUrl: 'javascript:alert(1)' })
    );
    expect(label).not.toContain('<a ');
    expect(label).not.toContain('javascript:');
  });

  test('quote injection in the policy URL cannot escape the href attribute', () => {
    const label = consentLabel(
      renderWith({
        clientDisclaimerUrl: 'https://example.nl/x?"onmouseover="alert(1)',
      })
    );
    expect(label).not.toContain('"onmouseover="');
    expect(label).toContain('<a href="https://example.nl/');
  });

  test('script tags in the disclaimer text are stripped', () => {
    const label = consentLabel(
      renderWith({
        clientDisclaimerUrl: 'https://example.nl/privacy',
        clientDisclaimerText: '<script>alert(1)</script>privacyverklaring',
      })
    );
    expect(label).not.toContain('<script>');
  });
});
