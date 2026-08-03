'use strict';

/**
 * Shared status logic for API tokens, used by both the admin token routes
 * (routes/api/api-token.js) and the auth middleware (middleware/user.js) so the
 * expiry/status rules can never drift between the two.
 */

// A token is expired once its expiry date has been reached. The comparison is
// inclusive: at the exact expiry instant the token is already expired, so the
// stored date is the first moment it no longer works.
// A null/undefined expiresAt means the token never expires.
function isExpired(apiToken, now = new Date()) {
  return !!(
    apiToken &&
    apiToken.expiresAt &&
    new Date(apiToken.expiresAt) <= now
  );
}

// Computes the lifecycle status shown in the admin overview.
// Soft-deleted = revoked; otherwise expired or active.
function computeStatus(apiToken, now = new Date()) {
  if (apiToken.deletedAt) return 'revoked';
  if (isExpired(apiToken, now)) return 'expired';
  return 'active';
}

// Adds a whole number of months to `from`, clamping the day-of-month to the
// last day of the target month. A plain Date#setMonth overflows into the next
// month for end-of-month dates (Jan 31 + 1 month => Mar 3), which would silently
// extend a token beyond its 1/3/12-month preset. The local time-of-day is kept,
// except when it falls in a DST spring-forward gap — then the Date normalises
// forward by an hour, which is irrelevant for a months-long validity period.
function computeExpiresAt(months, from = new Date()) {
  const expiresAt = new Date(from.getTime());
  const targetMonth = expiresAt.getMonth() + months;
  // Day 0 of the month after the target month = the target month's last day.
  const lastDayOfTargetMonth = new Date(
    expiresAt.getFullYear(),
    targetMonth + 1,
    0
  ).getDate();

  // Clamp the day BEFORE switching months, so setMonth can never overflow.
  expiresAt.setDate(Math.min(expiresAt.getDate(), lastDayOfTargetMonth));
  expiresAt.setMonth(targetMonth);
  return expiresAt;
}

module.exports = { isExpired, computeStatus, computeExpiresAt };
