/**
 * User unsubscribe-link service.
 *
 * Computes the md5 hash that authenticates an email-unsubscribe link
 * (`{salt}.{userId}.{projectId}`). Extracted from routes/api/user.js (#1640).
 * Pure — salt defaults to env so the controller can call it with just ids,
 * while tests pass an explicit salt.
 */
const crypto = require('crypto');

function computeUnsubscribeHash(
  userId,
  projectId,
  salt = process.env.USER_ID_SALT
) {
  const hash = crypto.createHash('md5');
  hash.update(`${salt}.${userId}.${projectId}`);
  return hash.digest('hex');
}

module.exports = {
  computeUnsubscribeHash,
};
