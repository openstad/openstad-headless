import { describe, expect, it } from 'vitest';

import {
  CONTENT_BOOLEAN_KEYS,
  CONTENT_KEYS,
  assertContentObject,
} from './notification-content-validator.js';

describe('assertContentObject', () => {
  it('accepts a complete content object', () => {
    expect(() =>
      assertContentObject({
        heading: 'Bedankt',
        greeting: 'Beste {{user.name}}',
        intro: 'Je inzending is ontvangen.',
        buttonLabel: 'Bekijk',
        buttonUrl: 'https://example.com',
        footer: 'Dit is een automatische e-mail.',
        showLogo: true,
      })
    ).not.toThrow();
  });

  // NULL is how a template says "managed as raw MJML", so it must pass.
  it('accepts null and undefined', () => {
    expect(() => assertContentObject(null)).not.toThrow();
    expect(() => assertContentObject(undefined)).not.toThrow();
  });

  it('accepts a null value for any known key', () => {
    expect(() =>
      assertContentObject({ heading: null, showLogo: null })
    ).not.toThrow();
  });

  it('rejects an array', () => {
    expect(() => assertContentObject(['heading'])).toThrow(
      'content must be an object'
    );
  });

  it('rejects a scalar', () => {
    expect(() => assertContentObject('heading')).toThrow(
      'content must be an object'
    );
  });

  it('rejects an unknown key instead of storing it', () => {
    expect(() => assertContentObject({ script: '<script>' })).toThrow(
      'content contains unknown key: script'
    );
  });

  it('rejects a non-string value on a text key', () => {
    expect(() => assertContentObject({ heading: 42 })).toThrow(
      'content.heading must be a string'
    );
  });

  it('rejects a non-boolean value on the flag key', () => {
    expect(() => assertContentObject({ showLogo: 'yes' })).toThrow(
      'content.showLogo must be a boolean'
    );
  });

  it('keeps the key sets separate', () => {
    expect(CONTENT_KEYS).not.toContain('showLogo');
    expect(CONTENT_BOOLEAN_KEYS).toEqual(['showLogo']);
  });
});
