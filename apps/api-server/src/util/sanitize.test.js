import { describe, expect, it } from 'vitest';

import sanitize from './sanitize.js';

describe('sanitize', () => {
  it('title preserves diacritics', () => {
    const input = 'Café Málagueña ñoño über';
    expect(sanitize.title(input)).toBe(input);
  });

  it('summary preserves diacritics', () => {
    const input = 'Café Málagueña ñoño über';
    expect(sanitize.summary(input)).toBe(input);
  });

  it('content preserves diacritics', () => {
    const input = 'Café Málagueña ñoño über';
    expect(sanitize.content(input)).toBe(input);
  });

  it('strips 4-byte characters (emoji) while keeping the rest of the text', () => {
    expect(sanitize.title('hi 😀')).toBe('hi ');
    expect(sanitize.summary('hi 😀')).toBe('hi ');
    expect(sanitize.content('hi 😀')).toBe('hi ');
  });

  it('returns null when null is passed in (sanitizeIfNotNull contract)', () => {
    // Note: sanitize.title() does not respect this contract (pre-existing
    // bug, unrelated to diacritics: it calls .replace() on the
    // sanitizeIfNotNull() result, which throws for null). Not covered here.
    expect(sanitize.summary(null)).toBeNull();
    expect(sanitize.content(null)).toBeNull();
    expect(sanitize.argument(null)).toBeNull();
    expect(sanitize.safeTags(null)).toBeNull();
    expect(sanitize.noTags(null)).toBeNull();
  });

  it('noTags strips HTML tags', () => {
    expect(sanitize.noTags('<strong>Bold</strong> text')).toBe('Bold text');
  });

  it('safeTags keeps allowed tags', () => {
    expect(sanitize.safeTags('<strong>Bold</strong> text')).toBe(
      '<strong>Bold</strong> text'
    );
  });

  it('content keeps allowed tags', () => {
    expect(sanitize.content('<strong>Bold</strong> text')).toBe(
      '<strong>Bold</strong> text'
    );
  });

  it('title replaces &amp; with &', () => {
    expect(sanitize.title('Fish &amp; Chips')).toBe('Fish & Chips');
  });
});
