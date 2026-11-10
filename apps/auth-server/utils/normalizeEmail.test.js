import { describe, expect, test } from 'vitest';

const normalizeEmail = require('./normalizeEmail');

describe('normalizeEmail', () => {
  test('trims and lower-cases', () => {
    expect(normalizeEmail('  Tosh@Example.NL ')).toBe('tosh@example.nl');
    expect(normalizeEmail('\ttosh@example.nl\n')).toBe('tosh@example.nl');
  });
  test('leaves non-strings alone', () => {
    expect(normalizeEmail(undefined)).toBeUndefined();
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(42)).toBe(42);
  });
});
