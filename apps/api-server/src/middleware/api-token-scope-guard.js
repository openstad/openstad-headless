'use strict';

const { matchComponent } = require('@openstad-headless/lib/report-data-scope');

// GET-routed paths that actually mutate state — must be blocked even for
// reporting tokens that only send GET requests.
const MUTATING_GET_SEGMENTS = ['/toggle', '/confirm', '/like', '/dislike'];

/**
 * Enforces data-scope access rules for reporting API requests.
 *
 * Activated only when req.apiTokenScope === 'reports' (set by user.js when a
 * reporting bearer token is resolved).  All other requests pass through
 * unmodified so existing behaviour is unchanged.
 *
 * Enforced rules:
 *  1. Only GET requests are allowed (reporting tokens are read-only).
 *  2. Paths that mutate state via GET (toggle, confirm, like …) are blocked
 *     with 403 regardless of project config.
 *  3. For component-specific paths the component must be enabled in the
 *     project's config.dataScope.  Disabled or unconfigured → 403.
 *  4. Resolved scope info is attached to req.reportingScope so the
 *     downstream field-filter middleware can project responses correctly.
 */
function apiTokenScopeGuard(req, res, next) {
  // Only apply to requests that carry a reporting-scope token.
  if (req.apiTokenScope !== 'reports') {
    return next();
  }

  // Reporting tokens are strictly read-only.
  if (req.method !== 'GET') {
    return res
      .status(403)
      .json({ error: 'Reporting tokens only allow GET requests' });
  }

  // Block GET paths that mutate state (exact path-segment matching).
  const pathLower = req.path.toLowerCase();
  for (const segment of MUTATING_GET_SEGMENTS) {
    const idx = pathLower.indexOf(segment);
    if (idx !== -1) {
      const after = pathLower[idx + segment.length];
      if (after === undefined || after === '/' || after === '?') {
        return res
          .status(403)
          .json({ error: 'Path not allowed for reporting tokens' });
      }
    }
  }

  const componentKey = matchComponent(req.path);

  if (componentKey) {
    const dataScope =
      req.project && req.project.config && req.project.config.dataScope;

    const componentCfg = dataScope && dataScope[componentKey];

    if (!componentCfg || !componentCfg.enabled) {
      return res.status(403).json({
        error: `Component '${componentKey}' is not enabled for this project's reporting scope`,
      });
    }

    req.reportingScope = {
      componentKey,
      enabledPersonalFields: componentCfg.personalFields || [],
    };
  } else {
    // Non-component path (e.g. /overview, aggregate root) — allowed without
    // component checks; no field filtering needed.
    req.reportingScope = { componentKey: null, enabledPersonalFields: [] };
  }

  return next();
}

module.exports = apiTokenScopeGuard;
