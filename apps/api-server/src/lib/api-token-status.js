'use strict';

/**
 * Shared status logic for API tokens, used by both the admin token routes
 * (routes/api/api-token.js) and the auth middleware (middleware/user.js) so the
 * expiry/status rules can never drift between the two.
 */

// A token is expired only when it has an expiry date that is in the past.
// A null/undefined expiresAt means the token never expires.
function isExpired(apiToken, now = new Date()) {
  return !!(
    apiToken &&
    apiToken.expiresAt &&
    new Date(apiToken.expiresAt) < now
  );
}

// Computes the lifecycle status shown in the admin overview.
// Soft-deleted = revoked; otherwise expired or active.
function computeStatus(apiToken, now = new Date()) {
  if (apiToken.deletedAt) return 'revoked';
  if (isExpired(apiToken, now)) return 'expired';
  return 'active';
}

module.exports = { isExpired, computeStatus };
