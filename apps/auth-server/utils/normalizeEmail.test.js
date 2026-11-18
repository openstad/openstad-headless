import { describe, expect, test } from 'vitest';

const normalizeEmail = require('./normalizeEmail');

describe('normalizeEmail', () => {
  test('trims and lower-cases', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com');
    expect(normalizeEmail('\tuser@example.com\n')).toBe('user@example.com');
  });
  test('leaves non-strings alone', () => {
    expect(normalizeEmail(undefined)).toBeUndefined();
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(42)).toBe(42);
  });
});
