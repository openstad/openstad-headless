import { describe, expect, test } from 'vitest';

import { sanitizeZipInput } from './sanitize-zip';

describe('sanitizeZipInput', () => {
  test('removes a space inside a postcode', () => {
    expect(sanitizeZipInput('1234 AA')).toBe('1234AA');
  });

  test('leaves an already space-free postcode unchanged', () => {
    expect(sanitizeZipInput('1234AA')).toBe('1234AA');
  });

  test('removes multiple and surrounding whitespace', () => {
    expect(sanitizeZipInput('  1234   AA  ')).toBe('1234AA');
  });

  test('strips tabs and other whitespace characters', () => {
    expect(sanitizeZipInput('1234\tAA')).toBe('1234AA');
  });

  test('returns an empty string for whitespace-only input', () => {
    expect(sanitizeZipInput('   ')).toBe('');
  });
});
