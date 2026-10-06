const sanitize = require('../util/sanitize');

// Keep in sync with packages/lib/timeline-date-precision.ts
const DATE_PRECISIONS = ['week', 'month', 'quarter', 'year', 'text'];
const DATE_LABEL_MAX_LENGTH = 60;

const asString = (v) =>
  typeof v === 'string' ? v : v == null ? '' : String(v);

/**
 * The optional date notation of a timeline item: a precision other than an
 * exact day, and for free text the label shown instead of the date. Returns
 * only the fields that should be stored; an exact day stores none.
 */
function normalizeTimelineDateFields(item) {
  if (!item || typeof item !== 'object') return {};

  const precision =
    typeof item.datePrecision === 'string' ? item.datePrecision : '';
  if (!DATE_PRECISIONS.includes(precision)) return {};
  if (precision !== 'text') return { datePrecision: precision };

  const label = sanitize
    .noTags(asString(item.dateLabel))
    .trim()
    .slice(0, DATE_LABEL_MAX_LENGTH);
  // Free text without a label falls back to an exact day.
  return label ? { datePrecision: 'text', dateLabel: label } : {};
}

module.exports = { normalizeTimelineDateFields };
