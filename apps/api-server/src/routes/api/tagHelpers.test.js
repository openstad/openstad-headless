import { describe, expect, test } from 'vitest';

import {
  isSeqnrProvided,
  isValidTagName,
  isValidTagType,
  normalizeTagType,
  resolveSeqnr,
} from './tagHelpers.js';

describe('normalizeTagType', () => {
  test('turns falsy values into null, matching the model setter', () => {
    expect(normalizeTagType(undefined)).toBe(null);
    expect(normalizeTagType(null)).toBe(null);
    expect(normalizeTagType('')).toBe(null);
    expect(normalizeTagType(0)).toBe(null);
    expect(normalizeTagType(false)).toBe(null);
  });

  test('trims and sanitizes so a lookup matches the stored value', () => {
    expect(normalizeTagType(' theme ')).toBe('theme');
    expect(normalizeTagType('thème')).toBe('theme');
  });

  test('turns a type that sanitizes down to nothing into null', () => {
    // The model setter stores null for these, so the lookup must match null.
    expect(normalizeTagType('   ')).toBe(null);
    expect(normalizeTagType('<script></script>')).toBe(null);
  });

  test('is idempotent, so re-applying it in the model setter is a no-op', () => {
    expect(normalizeTagType(normalizeTagType(' theme '))).toBe('theme');
  });

  test('leaves a truthy non-string untouched, so the caller can reject it', () => {
    // Coercing it here would turn junk into a real tag group: ['a', 'b']
    // would become the type 'a,b' and {} the type '[object Object]'.
    expect(normalizeTagType(42)).toBe(42);
    expect(normalizeTagType(['a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('isValidTagType', () => {
  test('accepts strings and the falsy values the model stores as null', () => {
    expect(isValidTagType(undefined)).toBe(true);
    expect(isValidTagType(null)).toBe(true);
    expect(isValidTagType('')).toBe(true);
    expect(isValidTagType('theme')).toBe(true);
  });

  test('rejects a truthy non-string instead of coercing it into a tag group', () => {
    expect(isValidTagType(42)).toBe(false);
    expect(isValidTagType(true)).toBe(false);
    expect(isValidTagType(['a', 'b'])).toBe(false);
    expect(isValidTagType({ x: 1 })).toBe(false);
  });
});

describe('isValidTagName', () => {
  test('accepts a string, so the model setter can trim it', () => {
    expect(isValidTagName('Verkeer')).toBe(true);
    // An empty name is left to the model's own allowNull validation.
    expect(isValidTagName('')).toBe(true);
  });

  test('rejects a missing name and any non-string', () => {
    expect(isValidTagName(undefined)).toBe(false);
    expect(isValidTagName(null)).toBe(false);
    expect(isValidTagName(42)).toBe(false);
    expect(isValidTagName(['a'])).toBe(false);
    expect(isValidTagName({ x: 1 })).toBe(false);
  });
});

describe('isSeqnrProvided', () => {
  test('treats undefined, null, empty and whitespace-only input as not provided', () => {
    expect(isSeqnrProvided(undefined)).toBe(false);
    expect(isSeqnrProvided(null)).toBe(false);
    expect(isSeqnrProvided('')).toBe(false);
    expect(isSeqnrProvided('   ')).toBe(false);
  });

  test('treats non-numeric and non-finite input as not provided', () => {
    expect(isSeqnrProvided('abc')).toBe(false);
    expect(isSeqnrProvided('10abc')).toBe(false);
    expect(isSeqnrProvided(true)).toBe(false);
    expect(isSeqnrProvided([])).toBe(false);
    expect(isSeqnrProvided({})).toBe(false);
    expect(isSeqnrProvided(Infinity)).toBe(false);
    expect(isSeqnrProvided(NaN)).toBe(false);
  });

  test('treats 0 and explicit numbers/numeric strings as provided', () => {
    expect(isSeqnrProvided(0)).toBe(true);
    expect(isSeqnrProvided(30)).toBe(true);
    expect(isSeqnrProvided(-10)).toBe(true);
    expect(isSeqnrProvided('30')).toBe(true);
    expect(isSeqnrProvided(' 30 ')).toBe(true);
  });
});

describe('resolveSeqnr', () => {
  test('places a tag without a seqnr one step past the group max', () => {
    expect(resolveSeqnr(undefined, 30)).toBe(40);
    expect(resolveSeqnr(null, 30)).toBe(40);
    expect(resolveSeqnr('', 30)).toBe(40);
    expect(resolveSeqnr('   ', 30)).toBe(40);
  });

  test('starts at 10 when the type group has no existing tags', () => {
    expect(resolveSeqnr(undefined, null)).toBe(10);
    expect(resolveSeqnr(undefined, undefined)).toBe(10);
    expect(resolveSeqnr(undefined, NaN)).toBe(10);
  });

  test('keeps an explicitly provided seqnr untouched, regardless of the group max', () => {
    expect(resolveSeqnr(5, 30)).toBe(5);
    expect(resolveSeqnr(0, 30)).toBe(0);
    expect(resolveSeqnr('15', 30)).toBe('15');
  });

  test('consecutive no-seqnr creates keep landing after the previous one', () => {
    const first = resolveSeqnr(undefined, 30); // 40
    const second = resolveSeqnr(undefined, first); // 50
    const third = resolveSeqnr(undefined, second); // 60
    expect([first, second, third]).toEqual([40, 50, 60]);
  });
});
