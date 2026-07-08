import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const { pseudonymizeUserId } = require('./pseudonymize');

describe('pseudonymizeUserId', () => {
  const prev = process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET;
  beforeEach(() => {
    process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET = 'test-secret';
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET;
    else process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET = prev;
  });

  it('is deterministic / stable for the same id', () => {
    expect(pseudonymizeUserId(42)).toBe(pseudonymizeUserId(42));
    expect(pseudonymizeUserId(42)).toBe(pseudonymizeUserId('42'));
  });

  it('differs from the raw id and between ids', () => {
    const a = pseudonymizeUserId(42);
    expect(a).not.toBe('42');
    expect(a).not.toBe(42);
    expect(a).not.toBe(pseudonymizeUserId(43));
    expect(a).toMatch(/^[0-9a-f]{64}$/); // hex sha256
  });

  it('returns null for anonymous rows (null/undefined/0)', () => {
    expect(pseudonymizeUserId(null)).toBeNull();
    expect(pseudonymizeUserId(undefined)).toBeNull();
    expect(pseudonymizeUserId(0)).toBeNull();
    expect(pseudonymizeUserId('0')).toBeNull();
  });

  it('throws a clear error when the secret is missing', () => {
    delete process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET;
    expect(() => pseudonymizeUserId(1)).toThrow(
      /OPENSTAD_REPORT_PSEUDONYM_SECRET/
    );
  });
});
