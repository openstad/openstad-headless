'use strict';

/**
 * flatten-submission — turns a Submission's free-form `submittedData` JSON
 * blob into flat, consistent `field_<key>` columns for reporting (#440).
 *
 * Form fields are PII by default (a form can ask anything) so they are
 * strictly per-field opt-in: only keys present in `enabledFieldKeys`
 * (project config `dataScope.submissions.formFields`, admin-configured) are
 * emitted. This is a separate allowlist from report-data-scope's
 * safeFields/personalFields catalog (which only knows fixed, cross-project
 * field names) — form fields are dynamic per project/widget, so they cannot
 * live in that static catalog.
 *
 * `submittedData` itself stays hard-blocked as a blob (report-data-scope
 * ALWAYS_BLOCKED_BLOBS); these flattened columns are injected AFTER the field
 * filter via makeReportEndpoint's `extraColumns` + report-finalize, the same
 * mechanism votes.js uses for `voteId`.
 */

// Confirmation/meta config (packages/enquete Confirmation type) — not form
// questions, so never treated as a form field even if a stray submittedData
// key happens to collide with one of these names.
const CONTROL_FIELD_KEYS = new Set([
  'confirmationUser',
  'userEmailAddress',
  'confirmationAdmin',
  'overwriteEmailAddress',
]);

/**
 * @param {object} item - a Widget.config.items[] entry
 * @returns {string|undefined}
 */
function fieldKeyOf(item) {
  // packages/enquete's Item type carries both `fieldKey` (the actual
  // submittedData key) and `key` (an internal/legacy reference); prefer
  // fieldKey, matching how the widget itself writes submittedData.
  return item && (item.fieldKey || item.key);
}

/**
 * @param {*} value
 * @returns {string|number|boolean|null}
 */
function normalizeValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'object') return JSON.stringify(value); // arrays (multi-choice) + objects
  return value;
}

/**
 * @param {object|null|undefined} submittedData - Submission.submittedData
 * @param {Array<object>} formItems - Widget.config.items (the form definition)
 * @param {string[]} enabledFieldKeys - dataScope.submissions.formFields allowlist
 * @returns {Record<string, string|number|boolean|null>} { [`field_${key}`]: value }
 */
function flattenSubmission(submittedData, formItems, enabledFieldKeys) {
  const data =
    submittedData && typeof submittedData === 'object' ? submittedData : {};
  const items = Array.isArray(formItems) ? formItems : [];
  const enabled = new Set(enabledFieldKeys || []);

  const out = {};
  const seen = new Set();
  for (const item of items) {
    const key = fieldKeyOf(item);
    // Orphan keys (in submittedData but not in the form definition) are
    // never visited here since we iterate the form definition, not
    // submittedData — consistent schema by construction.
    if (!key || CONTROL_FIELD_KEYS.has(key) || seen.has(key)) continue;
    seen.add(key);
    if (!enabled.has(key)) continue; // per-field opt-in — PII by default

    out[`field_${key}`] = normalizeValue(data[key]);
  }
  return out;
}

module.exports = { flattenSubmission, fieldKeyOf, CONTROL_FIELD_KEYS };
