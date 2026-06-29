'use strict';

const {
  getExposedFields,
  filterPayload,
} = require('@openstad-headless/lib/report-data-scope');

const isPrimitive = (v) =>
  v === null ||
  typeof v === 'number' ||
  typeof v === 'string' ||
  typeof v === 'boolean';

// A flat object whose values are all primitives, e.g. {counted: 5, date: '…'}.
const isFlatPrimitiveObject = (o) =>
  o !== null &&
  typeof o === 'object' &&
  !Array.isArray(o) &&
  Object.values(o).every(isPrimitive);

// A single value acceptable on an aggregate endpoint: a primitive, or an array
// of primitives / flat primitive objects.
const isAggregateValue = (v) =>
  isPrimitive(v) ||
  (Array.isArray(v) &&
    v.every((item) => isPrimitive(item) || isFlatPrimitiveObject(item)));

// A single row in a top-level aggregate array. Allowed when it is a primitive,
// or an object whose every value is itself an aggregate value (primitive, or an
// array of primitives / flat primitive objects). This permits real stats rows
// like {key, description, result: [{counted: 8}]} while still blocking records
// with nested non-aggregate objects (e.g. a user record with user: {email}).
const isAggregateRow = (r) =>
  isPrimitive(r) ||
  (r !== null &&
    typeof r === 'object' &&
    !Array.isArray(r) &&
    Object.values(r).every(isAggregateValue));

/**
 * Middleware that wraps res.json for reporting-token requests so that only
 * allowed fields are included in the response.
 *
 * Must be mounted AFTER api-token-scope-guard, which sets req.reportingScope.
 *
 * Applied only when req.apiTokenScope === 'reports'.  Non-reporting requests
 * are unaffected.
 *
 * Filtering rules:
 *  - Non-component paths (req.reportingScope.componentKey === null): only
 *    primitive / numeric metadata is allowed through.  Full object responses
 *    on unknown components are blocked (fail-closed).
 *  - Component paths: response is projected to safeFields + opted-in
 *    personalFields, then PII is stripped by filterPayload.
 *  - Metadata keys on paginated wrappers (count, total, …) pass through.
 */
function reportFieldFilter(req, res, next) {
  if (req.apiTokenScope !== 'reports') {
    return next();
  }

  const scope = req.reportingScope;
  if (!scope) {
    // Guard should have set this — if missing, block the response for safety.
    const originalJson = res.json.bind(res);
    res.json = function blockedJson() {
      return originalJson.call(res, { error: 'Reporting scope not resolved' });
    };
    return next();
  }

  const allowedFields = scope.componentKey
    ? getExposedFields(scope.componentKey, scope.enabledPersonalFields)
    : null;

  const originalJson = res.json.bind(res);

  res.json = function filteredJson(payload) {
    if (scope.componentKey === null) {
      // Aggregate / metadata endpoint — only primitive counts/dates may pass.
      // A top-level array must contain only aggregate rows (primitives or flat
      // primitive objects); a top-level object must be metadata-only. Anything
      // richer (e.g. an array of user records) is blocked (fail-closed).
      const blocked = () =>
        originalJson({
          error: 'Response blocked: unexpected payload on aggregate endpoint',
        });

      if (Array.isArray(payload)) {
        if (!payload.every(isAggregateRow)) {
          return blocked();
        }
      } else if (payload && typeof payload === 'object') {
        if (!Object.values(payload).every(isAggregateValue)) {
          return blocked();
        }
      }
      return originalJson(payload);
    }

    // Component endpoint — project to allowed fields.
    const filtered = filterPayload(payload, allowedFields);
    return originalJson(filtered);
  };

  return next();
}

module.exports = reportFieldFilter;
