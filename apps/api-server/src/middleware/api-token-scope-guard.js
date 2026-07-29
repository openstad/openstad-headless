'use strict';

const {
  matchComponent,
  COMPONENTS,
} = require('@openstad-headless/lib/report-data-scope');
const auditLogService = require('../services/audit-log');

// GET-routed paths that actually mutate state — must be blocked even for
// reporting tokens that only send GET requests.
const MUTATING_GET_SEGMENTS = ['/toggle', '/confirm', '/like', '/dislike'];

// Non-component path segments a reporting token may still reach. Everything
// else is denied (fail-closed). Only aggregate/stats endpoints belong here.
const ALLOWED_NON_COMPONENT_SEGMENTS = new Set(['overview']);

/**
 * Records a blocked non-component request so operators can later decide to add
 * the path to the allowlist.
 *
 * De-duplicated per (token, path): only the first block for a given token+path
 * is written, so an external tool that keeps polling a forbidden path cannot
 * flood audit_logs. Mirrors logExpiredTokenUse in user.js. Async and called
 * fire-and-forget; never affects the response.
 */
async function logBlockedReportingPath(req) {
  // Required lazily (like services/audit-log.js's own db access) so importing
  // this module doesn't eagerly require a working DB config.
  const db = require('../db');
  const tokenId = req.apiTokenId || null;
  const routePath = (req.path || '').substring(0, 500);

  // modelName is included so the (modelName, modelId, createdAt) index
  // (idx_audit_model_created) can serve this lookup; without it the query
  // would full-scan audit_logs on every blocked request.
  const existing = await db.AuditLog.findOne({
    where: {
      modelName: 'api-token',
      modelId: tokenId,
      action: 'reporting_path_blocked',
      routePath,
    },
  });
  if (existing) return;

  const entry = auditLogService.buildEntry(req, {
    action: 'reporting_path_blocked',
    modelName: 'api-token',
    modelId: tokenId,
    source: 'api',
    statusCode: 403,
  });
  // req.params is not populated at middleware level; take what we know.
  entry.projectId =
    req.apiTokenProjectId || (req.project && req.project.id) || null;
  // Dedup key is the path without query string; store the same value.
  entry.routePath = routePath;
  auditLogService.logDirect(entry);
}

/**
 * Returns the component keys the project has explicitly enabled for reporting.
 * Restricted to known catalog components so an unrelated dataScope key can
 * never widen access.
 */
function getEnabledComponents(req) {
  const dataScope =
    req.project && req.project.config && req.project.config.dataScope;
  if (!dataScope) return [];
  return Object.keys(COMPONENTS).filter(
    (key) => dataScope[key] && dataScope[key].enabled
  );
}

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
 *  4. Non-component paths are denied by default (fail-closed); only an explicit
 *     allowlist of aggregate endpoints (/overview) is permitted. Every blocked
 *     non-component path is logged so it can be added to the allowlist later.
 *  5. Resolved scope info is attached to req.reportingScope so the
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

  // /stats routes return aggregates ({count}, [{date, counted}]), not records.
  // The field filter must screen these by shape rather than project them to a
  // component's safeFields (which would empty a {count} payload).
  const isStatsPath = req.path.startsWith('/stats/');

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
      aggregate: isStatsPath,
    };
  } else {
    // Non-component path: deny by default. Only explicitly allowlisted
    // aggregate endpoints (e.g. /overview) may pass; anything else is a path a
    // reporting token has no business reaching (e.g. /user, /audit-log).
    // Anchor on the terminal path segment (consistent with matchComponent),
    // so an allowlisted word elsewhere in the path cannot open it up.
    const segments = pathLower.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const allowed = ALLOWED_NON_COMPONENT_SEGMENTS.has(lastSegment);

    if (!allowed) {
      logBlockedReportingPath(req).catch(() => {});
      return res
        .status(403)
        .json({ error: 'Path not allowed for reporting tokens' });
    }

    // Aggregate endpoints (e.g. /overview) derive their numbers from the
    // component data. If the project enabled no components, the token must
    // reach nothing — fail-closed, consistent with the per-component gate.
    const enabledComponents = getEnabledComponents(req);
    if (enabledComponents.length === 0) {
      logBlockedReportingPath(req).catch(() => {});
      return res.status(403).json({
        error: 'No reporting components are enabled for this project',
      });
    }

    req.reportingScope = {
      componentKey: null,
      enabledPersonalFields: [],
      enabledComponents,
    };
  }

  return next();
}

module.exports = apiTokenScopeGuard;
