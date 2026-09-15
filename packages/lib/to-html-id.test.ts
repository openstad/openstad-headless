import { describe, expect, test } from 'vitest';

import { toHtmlId } from './to-html-id';

// Een fieldKey komt uit de admin en mag spaties bevatten. Een HTML-id niet:
// in een aria-labelledby is de spatie het scheidingsteken tussen id's, dus
// "voor wie-row-0" wordt gelezen als twee losse verwijzingen die geen van
// beide bestaan.
describe('toHtmlId', () => {
  test('replaces spaces with a hyphen', () => {
    expect(toHtmlId('voor wie')).toBe('voor-wie');
    expect(toHtmlId('contact via e-mail')).toBe('contact-via-e-mail');
  });

  test('collapses runs of whitespace into one hyphen', () => {
    expect(toHtmlId('extra   vragen')).toBe('extra-vragen');
    expect(toHtmlId('anders\tdenken')).toBe('anders-denken');
  });

  test('leaves a key that is already valid untouched', () => {
    expect(toHtmlId('matrix-1')).toBe('matrix-1');
    expect(toHtmlId('tekstveld')).toBe('tekstveld');
  });

  test('strips characters that break css selectors', () => {
    expect(toHtmlId('vraag #1 (verplicht)')).toBe('vraag-1-verplicht');
    expect(toHtmlId('a.b:c')).toBe('a-b-c');
  });

  test('keeps underscores and hyphens', () => {
    expect(toHtmlId('veld_1-a')).toBe('veld_1-a');
  });

  test('trims leading and trailing separators', () => {
    expect(toHtmlId('  voor wie  ')).toBe('voor-wie');
    expect(toHtmlId('--voor wie--')).toBe('voor-wie');
  });

  test('handles an empty key', () => {
    expect(toHtmlId('')).toBe('');
    expect(toHtmlId('   ')).toBe('');
  });

  test('produces a value usable in an aria-labelledby list', () => {
    const id = toHtmlId('voor wie');
    expect(id).not.toContain(' ');
    expect(`${id}-row-0 ${id}-col-0`.split(/\s+/)).toHaveLength(2);
  });
});
