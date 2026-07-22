'use strict';

const crypto = require('crypto');

/**
 * Deterministic, non-reversible pseudonym for a raw user id, scoped to a
 * single project.
 *
 * Used across all reporting endpoints (#437/#440/#441/#442) so the same raw
 * user id always maps to the same pseudonym WITHIN a project — join-able
 * across tables for that project, but not traceable back to a person, and NOT
 * joinable across different projects (the projectId is part of the HMAC
 * input, so the same user gets a different pseudonym in each project).
 *
 * Returns null for anonymous rows: userId null/undefined, or the `0`
 * system/anonymous placeholder used by Vote/Comment in this codebase.
 *
 * Requires the OPENSTAD_REPORT_PSEUDONYM_SECRET env var; throws a clear error
 * when it is missing so a misconfigured reporting deployment fails loudly
 * instead of leaking a weak/empty-keyed hash. Likewise throws when projectId
 * is missing — fail loudly rather than silently produce a cross-project-
 * joinable (and thus more identifying) pseudonym.
 *
 * @param {number|string|null|undefined} rawUserId
 * @param {number|string} projectId
 * @returns {string|null}
 */
function pseudonymizeUserId(rawUserId, projectId) {
  if (rawUserId === null || rawUserId === undefined) return null;
  if (Number(rawUserId) === 0) return null;

  if (projectId === null || projectId === undefined || projectId === '') {
    throw new Error(
      'pseudonymizeUserId requires a projectId — the pseudonym must be scoped per project'
    );
  }

  const secret = process.env.OPENSTAD_REPORT_PSEUDONYM_SECRET;
  if (!secret) {
    throw new Error(
      'OPENSTAD_REPORT_PSEUDONYM_SECRET is not set — required to pseudonymize reporting user ids'
    );
  }

  return crypto
    .createHmac('sha256', secret)
    .update(`${projectId}:${rawUserId}`)
    .digest('hex');
}

module.exports = { pseudonymizeUserId };
