import { describe, expect, it } from 'vitest';

const { isExpired, computeStatus } = require('./api-token-status');

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
});
