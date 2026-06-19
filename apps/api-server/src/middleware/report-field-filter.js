const {
  matchComponent,
  getExposedFields,
  filterPayload,
} = require('@openstad-headless/lib/report-data-scope');

/**
 * For requests authenticated with a reporting API token (scope 'reports'), strip
 * the JSON response down to the fields the project has allowed for that component:
 * the component's safe (non-personal) preset plus any personal fields explicitly
 * opted in via the project's dataScope config. See #1647.
 *
 * This runs as a safety net regardless of what the route handler returns, so it
 * does not depend on the token owner's role or per-route field logic. Requests
 * without a reporting token, and the aggregated /stats endpoints, are untouched.
 */
module.exports = function reportFieldFilter(req, res, next) {
  if (req.apiTokenScope !== 'reports') {
    return next();
  }

  const componentKey = matchComponent(req.path);
  if (!componentKey) {
    // Not a raw component route (e.g. /stats) — no field filtering.
    return next();
  }

  const dataScope =
    req.project && req.project.config && req.project.config.dataScope;
  const allowedFields = getExposedFields(
    componentKey,
    dataScope && dataScope[componentKey]
  );
  if (!allowedFields) {
    // Component not enabled; the scope guard will already have blocked it.
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = function (payload) {
    let plain;
    try {
      // Serialize first so Sequelize model instances and nested includes become
      // plain objects before filtering.
      plain = JSON.parse(JSON.stringify(payload));
    } catch (err) {
      plain = payload;
    }
    return originalJson(filterPayload(plain, allowedFields));
  };

  return next();
};
