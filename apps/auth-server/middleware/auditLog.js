const os = require('os');

const HOSTNAME = os.hostname();

function getClientIp(req) {
  return req.ip || null;
}

function logAuthEvent(req, action, details = {}) {
  const endpoint = process.env.AUDIT_API_ENDPOINT;
  const token = process.env.AUDIT_API_TOKEN;

  if (!endpoint || !token) return;

  const user = req.user || {};

  const entry = {
    projectId: details.projectId || null,
    userId: user.id || details.userId || null,
    userName:
      user.displayName || user.name || user.email || details.userName || null,
    userRole: user.role || details.userRole || null,
    action,
    modelName: details.modelName || 'AuthSession',
    modelId: user.id || details.userId || null,
    newData: details.data || null,
    ipAddress: getClientIp(req),
    hostname: HOSTNAME,
    userAgent: req.headers?.['user-agent']?.substring(0, 500) || null,
    routePath: req.originalUrl?.substring(0, 500) || null,
    referer: req.headers?.referer?.substring(0, 500) || null,
    statusCode: details.statusCode || null,
  };

  // Fire-and-forget: never block the auth flow
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Audit-Token': token,
    },
    body: JSON.stringify(entry),
    signal: AbortSignal.timeout(5000),
  }).catch((err) => {
    console.error('Audit log forwarding failed:', err.message);
  });
}

module.exports = { logAuthEvent };
