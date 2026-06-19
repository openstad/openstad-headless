'use strict';

const {
  getExposedFields,
  filterPayload,
} = require('@openstad-headless/lib/report-data-scope');

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
      // Aggregate / metadata endpoint — allow only if every value at the top
      // level is a primitive (number, string, boolean) or an array of those.
      // Full object payloads on an unknown component are blocked.
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        const isMetadataOnly = Object.values(payload).every(
          (v) =>
            typeof v === 'number' ||
            typeof v === 'string' ||
            typeof v === 'boolean' ||
            v === null ||
            (Array.isArray(v) &&
              v.every(
                (item) =>
                  typeof item === 'number' ||
                  typeof item === 'string' ||
                  typeof item === 'boolean' ||
                  (typeof item === 'object' &&
                    item !== null &&
                    // Allow simple aggregate objects like {counted: 5, date: '2024-01-01'}
                    Object.values(item).every(
                      (iv) =>
                        typeof iv === 'number' ||
                        typeof iv === 'string' ||
                        typeof iv === 'boolean' ||
                        iv === null
                    ))
              ))
        );

        if (!isMetadataOnly) {
          return originalJson({
            error: 'Response blocked: unexpected object on aggregate endpoint',
          });
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
