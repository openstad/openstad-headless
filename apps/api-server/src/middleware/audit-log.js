const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');

const auditLogService = require('../services/audit-log');

const WRITE_METHODS = ['POST', 'PUT', 'DELETE'];

function resolveModelFromPath(path) {
  const segments = path.replace(/^\//, '').split('/');

  // /api/project/:projectId/<model>/...
  const projectIdx = segments.indexOf('project');
  if (projectIdx !== -1 && segments.length > projectIdx + 2) {
    const modelSegment = segments[projectIdx + 2];
    return {
      modelName: modelSegment,
      modelId: segments[projectIdx + 3] || null,
    };
  }

  // /api/project route (create/update project)
  if (segments[0] === 'project') {
    return {
      modelName: 'project',
      modelId: segments[1] || null,
    };
  }

  // Top-level routes: /api/<model>/...
  if (segments[0] && segments[0] !== 'api') {
    return {
      modelName: segments[0],
      modelId: segments[1] || null,
    };
  }

  return null;
}

function isAdminRole(user) {
  if (!user) return false;
  return (
    userHasRole(user, 'admin') ||
    userHasRole(user, 'superuser') ||
    user.role === 'admin' ||
    user.role === 'superuser'
  );
}

module.exports = function auditLogMiddleware(serviceOverride) {
  const service = serviceOverride || auditLogService;
  return function (req, res, next) {
    const method = req.method;
    const isWrite = WRITE_METHODS.includes(method);
    const isAdminRead = method === 'GET' && isAdminRole(req.user);

    if (!isWrite && !isAdminRead) return next();

    const resolved = resolveModelFromPath(req.path);
    if (!resolved) return next();

    // Capture a snapshot of req.results when it is first set by the route's
    // .all() handler. This must happen before the .put()/.delete() handler
    // mutates the Sequelize instance in place.
    let previousSnapshot = null;
    if (method === 'PUT' || method === 'DELETE') {
      let _results = req.results;
      Object.defineProperty(req, 'results', {
        get() {
          return _results;
        },
        set(val) {
          // Snapshot on first assignment only
          if (!previousSnapshot && val) {
            try {
              const raw = val.dataValues || val;
              previousSnapshot = JSON.parse(JSON.stringify(raw));
            } catch (e) {
              // Ignore serialization errors
            }
          }
          _results = val;
        },
        configurable: true,
        enumerable: true,
      });
    }

    const originalJson = res.json.bind(res);
    let jsonCalled = false;

    res.json = function (data) {
      if (jsonCalled) return originalJson(data);
      jsonCalled = true;

      const statusCode = res.statusCode;

      if (isWrite && statusCode >= 400) {
        return originalJson(data);
      }

      let previousData = previousSnapshot;
      let newData = null;
      let modelId = resolved.modelId;

      if (method === 'POST') {
        if (data && data.id) {
          modelId = data.id;
          newData = data.dataValues || data;
        }
      } else if (method === 'PUT') {
        if (data) {
          const rawNew = data.dataValues || data;
          newData = service.getChangedFields(previousData, rawNew);
          if (previousData && newData) {
            const changedPrev = {};
            for (const key of Object.keys(newData)) {
              if (previousData[key] !== undefined) {
                changedPrev[key] = previousData[key];
              }
            }
            previousData = changedPrev;
          }
        }
      }
      // For deletes, previousData is already captured, newData stays null

      service.log(req, {
        action: method,
        modelName: resolved.modelName,
        modelId: modelId ? parseInt(modelId) : null,
        previousData: method === 'GET' ? null : previousData,
        newData: method === 'GET' ? null : newData,
        source: 'api',
        statusCode,
      });

      return originalJson(data);
    };

    next();
  };
};
