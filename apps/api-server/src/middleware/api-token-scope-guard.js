const createError = require('http-errors');
const { matchComponent } = require('@openstad-headless/lib/report-data-scope');

/**
 * Restrict requests authenticated with a reporting API token (scope 'reports',
 * set in the user middleware) to the data they are allowed to read:
 *
 *  - the aggregated /stats endpoints are always allowed (safe by default);
 *  - a raw component route (plans/votes/comments/surveys/choiceguides) is only
 *    allowed when the project has explicitly enabled that component in its
 *    dataScope config, and only for read (GET) requests;
 *  - everything else is rejected with 403.
 *
 * The secure default (no dataScope config) therefore exposes nothing raw — a
 * reporting token then only reaches /stats. See #1647.
 */
module.exports = function apiTokenScopeGuard(req, res, next) {
  if (req.apiTokenScope !== 'reports') {
    return next();
  }

  // Aggregated reporting endpoints: always allowed.
  if (req.path.startsWith('/stats/') || req.path === '/stats') {
    return next();
  }

  // Raw component data: allowed only when the project enabled it, read-only.
  const componentKey = matchComponent(req.path);
  if (componentKey && req.method === 'GET') {
    const dataScope =
      req.project && req.project.config && req.project.config.dataScope;
    const componentConfig = dataScope && dataScope[componentKey];
    if (componentConfig && componentConfig.enabled) {
      return next();
    }
  }

  return next(
    createError(403, 'API token is only valid for reporting endpoints')
  );
};
