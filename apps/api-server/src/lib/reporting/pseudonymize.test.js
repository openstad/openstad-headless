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

  it('is deterministic / stable for the same id + project', () => {
    expect(pseudonymizeUserId(42, 1)).toBe(pseudonymizeUserId(42, 1));
    expect(pseudonymizeUserId(42, 1)).toBe(pseudonymizeUserId('42', 1));
  });

  it('differs from the raw id and between ids', () => {
    const a = pseudonymizeUserId(42, 1);
    expect(a).not.toBe('42');
    expect(a).not.toBe(42);
    expect(a).not.toBe(pseudonymizeUserId(43, 1));
    expect(a).toMatch(/^[0-9a-f]{64}$/); // hex sha256
  });

  it('returns null for anonymous rows (null/undefined/0)', () => {
    expect(pseudonymizeUserId(null, 1)).toBeNull();
    expect(pseudonymizeUserId(undefined, 1)).toBeNull();
    expect(pseudonymizeUserId(0, 1)).toBeNull();
    expect(pseudonymizeUserId('0', 1)).toBeNull();
  });

  it('throws a clear error when the secret is missing', () => {
    delete process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET;
    expect(() => pseudonymizeUserId(1, 1)).toThrow(
      /OPENSTAD_REPORT_PSEUDONYM_SECRET/
    );
  });

  it('the same user in a different project gets a different pseudonym (not joinable across projects)', () => {
    expect(pseudonymizeUserId(42, 1)).not.toBe(pseudonymizeUserId(42, 2));
  });

  it('throws a clear error when projectId is missing', () => {
    expect(() => pseudonymizeUserId(1, undefined)).toThrow(/projectId/);
    expect(() => pseudonymizeUserId(1, null)).toThrow(/projectId/);
    expect(() => pseudonymizeUserId(1, '')).toThrow(/projectId/);
  });

  it('does not throw for a missing projectId when the row is anonymous (short-circuits before the check)', () => {
    expect(pseudonymizeUserId(null, undefined)).toBeNull();
    expect(pseudonymizeUserId(0, undefined)).toBeNull();
  });
});
