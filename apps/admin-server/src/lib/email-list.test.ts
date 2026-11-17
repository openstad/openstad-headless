import { describe, expect, it } from 'vitest';

import { isEmailList } from './email-list';

describe('isEmailList', () => {
  it('accepts a single address', () => {
    expect(isEmailList('beheer@example.nl')).toBe(true);
  });

  it('accepts comma separated addresses with or without spaces', () => {
    expect(isEmailList('a@example.nl,b@example.nl')).toBe(true);
    expect(isEmailList(' a@example.nl , b@example.nl ')).toBe(true);
  });

  it('rejects a list with an invalid address', () => {
    expect(isEmailList('a@example.nl, geen-mail')).toBe(false);
  });

  it('rejects empty entries', () => {
    expect(isEmailList('a@example.nl,')).toBe(false);
    expect(isEmailList('a@example.nl,,b@example.nl')).toBe(false);
    expect(isEmailList('')).toBe(false);
  });
});
