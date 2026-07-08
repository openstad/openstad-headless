'use strict';

const crypto = require('crypto');

/**
 * Deterministic, non-reversible pseudonym for a raw user id.
 *
 * Used across all reporting endpoints (#437/#440/#441/#442) so the same raw
 * user id always maps to the same pseudonym — join-able across tables, but not
 * traceable back to a person.
 *
 * Returns null for anonymous rows: userId null/undefined, or the `0`
 * system/anonymous placeholder used by Vote/Comment in this codebase.
 *
 * Requires the OPENSTAD_REPORT_PSEUDONYM_SECRET env var; throws a clear error
 * when it is missing so a misconfigured reporting deployment fails loudly
 * instead of leaking a weak/empty-keyed hash.
 *
 * @param {number|string|null|undefined} rawUserId
 * @returns {string|null}
 */
function pseudonymizeUserId(rawUserId) {
  if (rawUserId === null || rawUserId === undefined) return null;
  if (Number(rawUserId) === 0) return null;

  const secret = process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET;
  if (!secret) {
    throw new Error(
      'OPENSTAD_REPORT_PSEUDONYM_SECRET is not set — required to pseudonymize reporting user ids'
    );
  }

  return crypto
    .createHmac('sha256', secret)
    .update(String(rawUserId))
    .digest('hex');
}

module.exports = { pseudonymizeUserId };
