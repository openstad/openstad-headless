const os = require('os');

const SENSITIVE_FIELDS = [
  'password',
  'hashedPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authToken',
  'jwtSecret',
  'secret',
];

const IGNORED_FIELDS = ['updatedAt', 'createdAt', 'deletedAt'];
const MAX_TEXT_LENGTH = 500;
const HOSTNAME = os.hostname();

let otlpLogger = null;

function getOtlpLogger() {
  if (otlpLogger) return otlpLogger;
  if (process.env.AUDIT_OTLP_ENABLED !== 'true') return null;

  try {
    const {
      LoggerProvider,
      BatchLogRecordProcessor,
    } = require('@opentelemetry/sdk-logs');
    const {
      OTLPLogExporter,
    } = require('@opentelemetry/exporter-logs-otlp-grpc');
    const { resourceFromAttributes } = require('@opentelemetry/resources');

    const endpoint =
      process.env.AUDIT_OTLP_ENDPOINT ||
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      'http://openstad-otel-collector:4317';

    const exporter = new OTLPLogExporter({ url: endpoint });

    const serviceName =
      process.env.AUDIT_OTLP_SERVICE_NAME ||
      (process.env.OTEL_SERVICE_NAME
        ? `${process.env.OTEL_SERVICE_NAME}-audit`
        : 'openstad-audit');

    const resource = resourceFromAttributes({
      'service.name': serviceName,
      'service.namespace': 'audit',
    });

    const provider = new LoggerProvider({
      resource,
      processors: [new BatchLogRecordProcessor(exporter)],
    });

    otlpLogger = provider.getLogger('audit');
  } catch (err) {
    console.error('Failed to initialize OTLP audit logger:', err.message);
    return null;
  }

  return otlpLogger;
}

function getClientIp(req) {
  return req.ip || null;
}

// Keep strings valid for a MySQL JSON column. Strip NULL bytes and other C0
// control chars (but keep tab, newline, carriage return) and replace lone
// surrogates, otherwise the write fails on a binary character set.
function toJsonSafeString(value) {
  // toWellFormed handles the surrogates; the regex strips C0 control chars.
  let safe = value
    .toWellFormed()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  if (safe.length > MAX_TEXT_LENGTH) {
    safe = safe.substring(0, MAX_TEXT_LENGTH) + '...';
  }
  return safe;
}

function sanitizeData(data, _seen) {
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    return toJsonSafeString(data.toString('base64'));
  }
  if (!data || typeof data !== 'object') {
    return typeof data === 'string' ? toJsonSafeString(data) : data;
  }

  const plain = data.dataValues || data;
  const seen = _seen || new WeakSet();
  if (seen.has(plain)) return undefined;
  seen.add(plain);

  const sanitized = {};
  for (const [key, value] of Object.entries(plain)) {
    if (SENSITIVE_FIELDS.includes(key) || IGNORED_FIELDS.includes(key))
      continue;

    if (typeof value === 'string') {
      sanitized[key] = toJsonSafeString(value);
    } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
      sanitized[key] = toJsonSafeString(value.toString('base64'));
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        item && typeof item === 'object' ? sanitizeData(item, seen) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeData(value, seen);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function getChangedFields(previousData, newData) {
  if (!previousData || !newData) return newData;

  const changed = {};
  const prevKeys = new Set(Object.keys(previousData));
  for (const key of Object.keys(newData)) {
    if (SENSITIVE_FIELDS.includes(key) || IGNORED_FIELDS.includes(key))
      continue;
    if (!prevKeys.has(key)) continue;

    if (JSON.stringify(previousData[key]) !== JSON.stringify(newData[key])) {
      changed[key] = newData[key];
    }
  }
  return Object.keys(changed).length > 0 ? changed : null;
}

function buildEntry(
  req,
  { action, modelName, modelId, previousData, newData, source, statusCode }
) {
  const user = req.user || {};

  return {
    projectId: req.params?.projectId ? parseInt(req.params.projectId) : null,
    userId: user.id || null,
    userName: user.displayName || user.name || user.email || null,
    userRole: user.role || null,
    action,
    modelName,
    modelId: modelId ? parseInt(modelId) : null,
    previousData: previousData ? sanitizeData(previousData) : null,
    newData: newData ? sanitizeData(newData) : null,
    ipAddress: getClientIp(req),
    hostname: HOSTNAME,
    userAgent: req.headers?.['user-agent']?.substring(0, 500) || null,
    routePath: req.originalUrl?.substring(0, 500) || null,
    referer: req.headers?.referer?.substring(0, 500) || null,
    statusCode: statusCode || null,
    source: source || 'api',
  };
}

async function writeToDatabase(entry) {
  try {
    const db = require('../db');
    if (db.AuditLog) {
      await db.AuditLog.create(entry);
    }
  } catch (err) {
    console.error('Audit log DB write failed:', {
      error: err.message,
      action: entry.action,
      modelName: entry.modelName,
      modelId: entry.modelId,
      projectId: entry.projectId,
    });
  }
}

function emitOtlp(entry) {
  const logger = getOtlpLogger();
  if (!logger) return;

  try {
    const { SeverityNumber } = require('@opentelemetry/api-logs');

    logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: JSON.stringify(entry),
      attributes: {
        'audit.action': entry.action,
        'audit.model': entry.modelName,
        'audit.model_id': entry.modelId != null ? String(entry.modelId) : '',
        'audit.source': entry.source || 'api',
        'audit.project_id':
          entry.projectId != null ? String(entry.projectId) : '',
        'audit.user_id': entry.userId != null ? String(entry.userId) : '',
        'audit.user_name': entry.userName || '',
        'audit.user_role': entry.userRole || '',
        'audit.ip_address': entry.ipAddress || '',
        'audit.route_path': entry.routePath || '',
        'audit.referer': entry.referer || '',
        'audit.status_code':
          entry.statusCode != null ? String(entry.statusCode) : '',
        'audit.hostname': entry.hostname || '',
        'audit.user_agent': entry.userAgent || '',
      },
    });
  } catch (err) {
    console.error('Audit log OTLP emit failed:', err.message);
  }
}

function init() {
  if (process.env.AUDIT_OTLP_ENABLED !== 'true') return;

  const logger = getOtlpLogger();
  if (logger) {
    console.log('[audit] OTLP logger initialized successfully');
  } else {
    console.error(
      '[audit] OTLP logger failed to initialize — audit events will only be written to the database'
    );
  }
}

function log(req, options) {
  const entry = buildEntry(req, options);

  setImmediate(() => {
    writeToDatabase(entry);
    emitOtlp(entry);
  });

  return entry;
}

function logDirect(entry) {
  setImmediate(() => {
    writeToDatabase(entry);
    emitOtlp(entry);
  });
}

module.exports = {
  init,
  log,
  logDirect,
  buildEntry,
  sanitizeData,
  getChangedFields,
  getClientIp,
};
