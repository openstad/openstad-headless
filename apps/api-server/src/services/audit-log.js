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

const MAX_TEXT_LENGTH = 500;

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
    const { Resource } = require('@opentelemetry/resources');

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

    const resource = new Resource({
      'service.name': serviceName,
      'service.namespace': 'audit',
    });

    const provider = new LoggerProvider({ resource });
    provider.addLogRecordProcessor(new BatchLogRecordProcessor(exporter));

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

function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.includes(key)) continue;

    if (typeof value === 'string' && value.length > MAX_TEXT_LENGTH) {
      sanitized[key] = value.substring(0, MAX_TEXT_LENGTH) + '...';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function getChangedFields(previousData, newData) {
  if (!previousData || !newData) return newData;

  const changed = {};
  for (const key of Object.keys(newData)) {
    if (SENSITIVE_FIELDS.includes(key)) continue;

    const prev = previousData[key];
    const next = newData[key];

    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      changed[key] = next;
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
    hostname: os.hostname(),
    userAgent: req.headers?.['user-agent']?.substring(0, 500) || null,
    routePath: req.originalUrl?.substring(0, 500) || null,
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
    console.error('Audit log DB write failed:', err.message);
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
        'audit.status_code':
          entry.statusCode != null ? String(entry.statusCode) : '',
        'audit.hostname': entry.hostname || '',
      },
    });
  } catch (err) {
    console.error('Audit log OTLP emit failed:', err.message);
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
  log,
  logDirect,
  buildEntry,
  sanitizeData,
  getChangedFields,
  getClientIp,
};
