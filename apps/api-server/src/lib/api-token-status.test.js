import { describe, expect, it } from 'vitest';

const {
  isExpired,
  computeStatus,
  computeExpiresAt,
} = require('./api-token-status');

const NOW = new Date('2026-06-26T12:00:00Z');
const PAST = new Date('2026-06-25T12:00:00Z');
const FUTURE = new Date('2026-07-26T12:00:00Z');

describe('api-token-status', () => {
  describe('isExpired', () => {
    it('returns false for a null/undefined token', () => {
      expect(isExpired(null, NOW)).toBe(false);
      expect(isExpired(undefined, NOW)).toBe(false);
    });

    it('returns false when expiresAt is null (never expires)', () => {
      expect(isExpired({ expiresAt: null }, NOW)).toBe(false);
    });

    it('returns true for a past expiry', () => {
      expect(isExpired({ expiresAt: PAST }, NOW)).toBe(true);
    });

    it('returns false for a future expiry', () => {
      expect(isExpired({ expiresAt: FUTURE }, NOW)).toBe(false);
    });

    it('treats the exact expiry instant as expired', () => {
      expect(isExpired({ expiresAt: NOW }, NOW)).toBe(true);
      expect(isExpired({ expiresAt: new Date(NOW.getTime() + 1) }, NOW)).toBe(
        false
      );
    });

    it('accepts an ISO string expiry, as returned by the API', () => {
      expect(isExpired({ expiresAt: PAST.toISOString() }, NOW)).toBe(true);
      expect(isExpired({ expiresAt: FUTURE.toISOString() }, NOW)).toBe(false);
    });
  });

  describe('computeStatus', () => {
    it('returns revoked when soft-deleted (takes precedence over expiry)', () => {
      expect(computeStatus({ deletedAt: PAST, expiresAt: PAST }, NOW)).toBe(
        'revoked'
      );
    });

    it('returns expired for a past expiry', () => {
      expect(computeStatus({ deletedAt: null, expiresAt: PAST }, NOW)).toBe(
        'expired'
      );
    });

    it('returns active for a future expiry', () => {
      expect(computeStatus({ deletedAt: null, expiresAt: FUTURE }, NOW)).toBe(
        'active'
      );
    });

    it('returns active when there is no expiry (never expires)', () => {
      expect(computeStatus({ deletedAt: null, expiresAt: null }, NOW)).toBe(
        'active'
      );
    });
  });

  // computeExpiresAt works in local time (getMonth/getFullYear), so these
  // fixtures are built with the local-time Date constructor to stay
  // timezone-independent.
  describe('computeExpiresAt', () => {
    function local(y, m, d, h = 14, min = 30) {
      return new Date(y, m, d, h, min, 0, 0);
    }

    function parts(date) {
      return [
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
      ];
    }

    it('adds whole months for a mid-month date', () => {
      expect(parts(computeExpiresAt(1, local(2026, 0, 15)))).toEqual([
        2026, 1, 15, 14, 30,
      ]);
      expect(parts(computeExpiresAt(3, local(2026, 0, 15)))).toEqual([
        2026, 3, 15, 14, 30,
      ]);
      expect(parts(computeExpiresAt(12, local(2026, 0, 15)))).toEqual([
        2027, 0, 15, 14, 30,
      ]);
    });

    it('clamps Jan 31 + 1 month to Feb 28 instead of overflowing into March', () => {
      expect(parts(computeExpiresAt(1, local(2026, 0, 31)))).toEqual([
        2026, 1, 28, 14, 30,
      ]);
    });

    it('clamps to Feb 29 in a leap year', () => {
      expect(parts(computeExpiresAt(1, local(2028, 0, 31)))).toEqual([
        2028, 1, 29, 14, 30,
      ]);
    });

    it('clamps a 31-day month to a 30-day target month', () => {
      // May 31 + 1 month => June 30 (June has 30 days), not July 1
      expect(parts(computeExpiresAt(1, local(2026, 4, 31)))).toEqual([
        2026, 5, 30, 14, 30,
      ]);
    });

    it('rolls over the year without overflowing', () => {
      // Dec 31 + 3 months => Mar 31 of the next year
      expect(parts(computeExpiresAt(3, local(2026, 11, 31)))).toEqual([
        2027, 2, 31, 14, 30,
      ]);
    });

    it('produces a date that is not yet expired', () => {
      const from = local(2026, 0, 31);
      expect(isExpired({ expiresAt: computeExpiresAt(1, from) }, from)).toBe(
        false
      );
    });
  });
});
