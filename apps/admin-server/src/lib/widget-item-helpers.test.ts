import { describe, expect, it } from 'vitest';

import { generateId, withId } from './widget-item-helpers';

describe('generateId', () => {
  it('returns a non-empty base36 string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(id).toMatch(/^[0-9a-z]+$/);
  });

  it('produces distinct values across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    // Collisions are possible but should be vanishingly rare at this sample size.
    expect(ids.size).toBeGreaterThan(990);
  });
});

describe('withId', () => {
  it('keeps an existing id untouched', () => {
    const item = { id: 'abc', label: 'Item' };
    expect(withId(item)).toBe(item);
  });

  it('adds a generated id when none is present', () => {
    const item = { label: 'Item' };
    const result = withId(item);
    expect(result).not.toBe(item);
    expect(result.label).toBe('Item');
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
  });

  it('treats a falsy id (empty string, 0) as missing', () => {
    expect(withId({ id: '' }).id).not.toBe('');
    expect(withId({ id: 0 }).id).not.toBe(0);
  });
});
