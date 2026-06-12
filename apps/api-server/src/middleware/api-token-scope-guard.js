const createError = require('http-errors');

/**
 * Block requests authenticated with an API token from accessing any route
 * other than /stats. The token scope is set to 'reports' in the user middleware.
 */
module.exports = function apiTokenScopeGuard(req, res, next) {
  if (req.apiTokenScope !== 'reports') {
    return next();
  }

  if (req.path.startsWith('/stats/') || req.path === '/stats') {
    return next();
  }

  return next(
    createError(403, 'API token is only valid for reporting endpoints')
  );
};
