import { describe, expect, it } from 'vitest';

import { slugify } from './slugify';

describe('slugify', () => {
  it('returns an empty string for empty or nullish input', () => {
    expect(slugify('')).toBe('');
    expect(slugify(undefined as unknown as string)).toBe('');
  });

  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Mijn Wijk 2026')).toBe('mijn-wijk-2026');
    expect(slugify('A B C')).toBe('a-b-c');
  });

  it('removes special characters', () => {
    expect(slugify('Mijn Wijk! @ # % 2026')).toBe('mijn-wijk-2026');
  });

  it('strips diacritics', () => {
    expect(slugify('Café België')).toBe('cafe-belgie');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  @#% Test  ')).toBe('test');
  });

  it('keeps existing hyphens without duplicating them', () => {
    expect(slugify('Al-Bestaand')).toBe('al-bestaand');
  });
});
