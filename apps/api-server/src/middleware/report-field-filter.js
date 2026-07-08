'use strict';

const {
  getExposedFields,
  filterPayload,
  ALWAYS_BLOCKED_USER_KEYS,
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

// Defense in depth for aggregate endpoints: even a shape-valid flat row must
// never carry a personal-data key (email, postcode, name, …). isAggregateRow
// accepts any flat object of primitives, so a row like {id, email, postcode}
// would otherwise pass — this catches it. Also scans flat objects nested in
// array values (e.g. an aggregate row's `result: [{…}]`).
const hasBlockedKey = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  for (const [key, value] of Object.entries(obj)) {
    if (ALWAYS_BLOCKED_USER_KEYS.has(key)) return true;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (hasBlockedKey(item)) return true;
      }
    }
  }
  return false;
};

// Validates that a payload is a genuine aggregate response (counts/dates) and
// carries no personal-data keys. Returns true when safe to pass through.
const isSafeAggregate = (payload) => {
  if (Array.isArray(payload)) {
    return payload.every((row) => isAggregateRow(row) && !hasBlockedKey(row));
  }
  if (payload && typeof payload === 'object') {
    return (
      Object.values(payload).every(isAggregateValue) && !hasBlockedKey(payload)
    );
  }
  return true; // primitive
};

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
    // Error responses (4xx/5xx) pass through untouched. They are synthesized by
    // this app — e.g. the reporting filter's { error: {code,message,param,hint} }
    // shape (filters.js) or the error-handler's { status, message, … } — never
    // raw DB records, so they carry no PII. Projecting them to safeFields would
    // empty the body and make a 404 indistinguishable from a 500 or a scope block.
    if (res.statusCode >= 400) {
      return originalJson(payload);
    }

    // Schema/metadata responses (e.g. /submissions/fields, #440): the route
    // itself sets this because it returns form STRUCTURE (field name/label/
    // type), not participant data, so projecting it to the component's
    // safeFields would empty it out. Still gated by the scope-guard's normal
    // component-enabled check, same as any other reporting request.
    if (req.reportSchemaResponse) {
      return originalJson(payload);
    }

    // Aggregate endpoints — the /overview allowlist (componentKey === null) and
    // the /stats component counts (scope.aggregate). Both return counts/dates,
    // not records, so field projection would empty them. Validate by shape and
    // screen for PII instead (fail-closed on anything richer, e.g. a user list).
    if (scope.componentKey === null || scope.aggregate) {
      if (!isSafeAggregate(payload)) {
        return originalJson({
          error: 'Response blocked: unexpected payload on aggregate endpoint',
        });
      }
      return originalJson(payload);
    }

    // Component record endpoint — project to allowed fields.
    const filtered = filterPayload(payload, allowedFields);
    return originalJson(filtered);
  };

  return next();
}

module.exports = reportFieldFilter;
