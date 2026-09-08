import { describe, expect, it } from 'vitest';

import { purposeAttributes } from './field-purpose';

describe('purposeAttributes', () => {
  it('geeft type en autocomplete voor e-mail en telefoon', () => {
    expect(purposeAttributes('email')).toEqual({
      type: 'email',
      autoComplete: 'email',
    });
    expect(purposeAttributes('tel')).toEqual({
      type: 'tel',
      autoComplete: 'tel',
    });
  });

  it('geeft het juiste autocomplete-token voor elk tekstdoel', () => {
    const tokens: Record<string, string> = {
      name: 'name',
      'given-name': 'given-name',
      'family-name': 'family-name',
      'postal-code': 'postal-code',
      'street-address': 'street-address',
      'address-level2': 'address-level2',
    };
    for (const [variant, token] of Object.entries(tokens)) {
      expect(purposeAttributes(variant)).toEqual({
        type: 'text',
        autoComplete: token,
      });
    }
  });

  it('geeft alleen type text zonder autocomplete voor niet-doel-varianten', () => {
    for (const variant of ['text input', 'textarea', 'richtext', 'onbekend']) {
      expect(purposeAttributes(variant)).toEqual({ type: 'text' });
    }
    expect(purposeAttributes(undefined)).toEqual({ type: 'text' });
  });
});
