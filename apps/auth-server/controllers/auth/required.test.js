import { describe, expect, test } from 'vitest';

const required = require('./required');

function renderWith(requiredUserFields) {
  let rendered;
  const req = {
    client: {
      id: 1,
      clientId: 'abc',
      requiredUserFields,
      config: {
        clientDisclaimerUrl: 'https://example.nl/privacy',
        requiredFields: {
          requiredUserFieldsLabels: {
            privacyConsent: 'Ik ga akkoord met de {link}',
          },
        },
      },
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

describe('required-fields page', () => {
  test('no longer asks for privacy consent from an older client config', () => {
    const rendered = renderWith(['name', 'privacyConsent']);
    expect(rendered.locals.requiredFields.map((field) => field.key)).toEqual([
      'name',
    ]);
  });
});
