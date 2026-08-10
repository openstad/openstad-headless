'use strict';

/**
 * require-reporting-token — fail-closed authentication gate for the reporting
 * API (mounted at the top of routes/api/reports; covers /reports/*).
 *
 * The reporting endpoints (makeReportEndpoint) carry NO auth of their own and
 * rely entirely on the upstream reporting middleware — api-token-scope-guard,
 * report-finalize, report-field-filter. Each of those begins with
 * `if (req.apiTokenScope !== 'reports') return next();`, which only limits what
 * a valid reporting token may reach; none of them REQUIRES that a token is
 * present. So a request with no Authorization header (or an invalid/expired
 * osr_ token) flows straight through to the handlers and receives 200 + real
 * data — a critical auth leak.
 *
 * req.apiTokenScope is set to 'reports' by getUser/handleApiToken (user.js)
 * ONLY after a valid, non-expired, project-bound osr_ token is resolved.
 * Requiring it here closes the hole: anything without a valid reporting token
 * gets 401 and no data.
 *
 * 401 (not 403) on purpose: this is an authentication failure (no/invalid
 * credentials). api-token-scope-guard keeps its 403s for the
 * authenticated-but-forbidden cases (component disabled, path not allowed).
 */
function requireReportingToken(req, res, next) {
  if (req.apiTokenScope !== 'reports') {
    res.set('WWW-Authenticate', 'Bearer');
    return res
      .status(401)
      .json({ error: 'A valid reporting API token is required' });
  }
  return next();
}

module.exports = requireReportingToken;
