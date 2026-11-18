import { describe, expect, it } from 'vitest';

const dateFilter = require('./dateFilter');

describe('dateFilter', () => {
  it('formats a date with the default format', () => {
    const result = dateFilter('2026-03-15');
    expect(result).toContain('2026');
  });

  it('formats a date with a custom format string', () => {
    expect(dateFilter('2026-03-15', 'YYYY-MM-DD')).toBe('2026-03-15');
  });

  it('calls an allowed moment method by name', () => {
    expect(dateFilter('2026-03-15', 'toISOString')).toMatch(/^2026-03-1/);
    expect(dateFilter('2026-03-15', 'unix')).toBeGreaterThan(0);
  });

  it('falls back to format() for disallowed methods', () => {
    for (const method of ['constructor', 'clone', 'add', 'subtract', 'set']) {
      const result = dateFilter('2026-03-15', method);
      expect(typeof result).toBe('string');
      expect(result).not.toContain('function');
    }
  });

  it('returns an error string for falsy dates', () => {
    expect(dateFilter(null)).toBe('Onbekende datum');
    expect(dateFilter('')).toBe('Onbekende datum');
  });
});
