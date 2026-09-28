'use strict';

/**
 * report-finalize — reporting response finalizer.
 *
 * MUST be mounted in Server.js immediately BEFORE report-field-filter, so its
 * res.json wrapper is installed first and therefore runs AFTER the field-filter
 * has projected/stripped the payload. That lets it re-attach data the field
 * filter would otherwise drop, WITHOUT touching the #313 report-data-scope
 * catalog:
 *
 *   - top-level `nextLink`  (report-field-filter's filterPayload keeps only
 *     { metadata, data } and drops nextLink)   → from req.reportNextLink
 *   - pseudonymous `userId` (raw userId is hard-blocked by the field filter)
 *     → from req.reportUserPseudonyms, keyed by record id
 *   - extra columns (e.g. votes.voteId, and later #440 form fields / #441 answer
 *     columns) → from req.reportExtraColumns, keyed by record id
 *
 * Only acts for reporting-token requests (req.apiTokenScope === 'reports') that
 * went through the reporting pipeline (req.reportNextLink defined). Aggregate /
 * non-reporting responses pass through untouched.
 */
function reportFinalize(req, res, next) {
  if (req.apiTokenScope !== 'reports') return next();

  const originalJson = res.json.bind(res);

  res.json = function finalizedJson(payload) {
    // Only finalize responses produced by the reporting pagination pipeline.
    if (req.reportNextLink === undefined) {
      return originalJson(payload);
    }

    // After report-field-filter, a component payload is either a bare array or
    // a { metadata, data } wrapper. Extract the data array.
    let data = null;
    if (Array.isArray(payload)) {
      data = payload;
    } else if (payload && Array.isArray(payload.data)) {
      data = payload.data;
    }
    if (data === null) {
      return originalJson(payload);
    }

    const pseudonyms = req.reportUserPseudonyms;
    const extra = req.reportExtraColumns || {};

    for (const rec of data) {
      if (!rec || typeof rec !== 'object') continue;
      if (pseudonyms) {
        rec.userId = Object.prototype.hasOwnProperty.call(pseudonyms, rec.id)
          ? pseudonyms[rec.id]
          : null;
      }
      const cols = extra[rec.id];
      if (cols) Object.assign(rec, cols);
    }

    return originalJson({ data, nextLink: req.reportNextLink });
  };

  return next();
}

module.exports = reportFinalize;
