'use strict';

const { Op } = require('sequelize');
// component-registry itself never touches the DB at require-time (db is
// required lazily inside getModel/getFieldTypes), so pulling in
// getProjectScope/getFieldTypes here does not load the database layer — unit
// tests that inject opts.fieldTypes still never need a real DB connection.
const { getProjectScope } = require('./component-registry');

// Query params the reporting endpoints understand. Everything else is ignored
// (no error) — e.g. a stray projectId query param (projectId comes from the path).
const KNOWN_PARAMS = new Set([
  'dateFrom',
  'dateTo',
  'status',
  'page',
  'pageSize',
]);

/**
 * Structured, actionable filter error. The route turns it into an HTTP 400 with
 * body { error: { code, message, param, hint } }.
 */
class ReportingFilterError extends Error {
  constructor(code, message, param, hint) {
    super(message);
    this.name = 'ReportingFilterError';
    this.code = code;
    this.param = param;
    this.hint = hint;
  }
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses a date param. Accepts a bare 'YYYY-MM-DD' (interpreted as UTC
 * midnight) or a full ISO-8601 datetime. All UTC. Throws ReportingFilterError
 * on an unparseable value.
 * @returns {Date}
 */
function parseDateParam(value, param) {
  const str = String(value);
  const d = DATE_ONLY_RE.test(str)
    ? new Date(`${str}T00:00:00Z`)
    : new Date(str);
  if (Number.isNaN(d.getTime())) {
    throw new ReportingFilterError(
      'invalid_date',
      `'${param}' is not a valid date: '${str}'`,
      param,
      'Use YYYY-MM-DD or ISO-8601 UTC, e.g. 2026-01-01 or 2026-01-01T00:00:00Z'
    );
  }
  return d;
}

/**
 * Builds the Sequelize `where` (and, for components scoped via an
 * association, an abstract `include` descriptor) for a reporting query.
 *
 * - Project scope always comes from the PATH (via req.project.id), never a
 *   query param, and its strategy is looked up per component from
 *   component-registry's getProjectScope — most components have a direct
 *   `projectId`/`id` column ('column' scope), but Vote/Comment only reach
 *   their project via their `resource` association ('viaResource' scope),
 *   since those tables have no projectId column of their own.
 * - For 'viaResource' components this returns `include: [{ viaModel, where }]`
 *   — a plain-data descriptor, NOT a real Sequelize include (filters.js stays
 *   DB-free so unit tests can inject fieldTypes without a DB). It is resolved
 *   into a real `{ model: db[...] }` include by make-report-endpoint.js,
 *   which already depends on db, and merged with any component-specific
 *   include (e.g. enquiries' Widget.type='enquete' join).
 * - createdAt is filtered as a half-open interval [dateFrom, dateTo) in UTC.
 * - status is applied only for components that actually have a `status` column;
 *   otherwise a 400 is thrown.
 * - Unknown query params are ignored.
 *
 * @param {import('express').Request} req
 * @param {string} componentKey
 * @param {{fieldTypes?:Record<string,string>}} [opts] - inject fieldTypes to avoid db in tests
 * @returns {{where: object, include?: Array<{viaModel:string, where:object}>}}
 */
function buildReportingWhere(req, componentKey, opts = {}) {
  if (!req.project || req.project.id === undefined || req.project.id === null) {
    // Should never happen on /api/project/:projectId/reports/* (project
    // middleware sets req.project); fail loudly rather than leak cross-project.
    throw new ReportingFilterError(
      'no_project',
      'No project resolved for this reporting request',
      'projectId',
      'Reporting endpoints must be called under /api/project/:projectId/reports/*'
    );
  }

  const q = req.query || {};

  const scope = getProjectScope(componentKey);
  const where = {};
  let include;
  if (scope.type === 'column') {
    where[scope.column] = req.project.id;
  } else if (scope.type === 'viaResource') {
    include = [{ viaModel: 'Resource', where: { projectId: req.project.id } }];
  } else {
    // Defensive: only reachable if component-registry gains a new scope type
    // that filters.js doesn't know how to translate yet.
    throw new Error(
      `Unsupported project-scope type '${scope.type}' for component '${componentKey}'`
    );
  }

  // Date range on createdAt — half-open [from, to)
  const createdAt = {};
  if (q.dateFrom !== undefined && q.dateFrom !== '') {
    createdAt[Op.gte] = parseDateParam(q.dateFrom, 'dateFrom');
  }
  if (q.dateTo !== undefined && q.dateTo !== '') {
    createdAt[Op.lt] = parseDateParam(q.dateTo, 'dateTo');
  }
  if (
    createdAt[Op.gte] &&
    createdAt[Op.lt] &&
    createdAt[Op.gte] >= createdAt[Op.lt]
  ) {
    throw new ReportingFilterError(
      'invalid_date_range',
      'dateFrom must be strictly before dateTo',
      'dateFrom',
      'The range is half-open [dateFrom, dateTo); ensure dateFrom < dateTo'
    );
  }
  if (Object.getOwnPropertySymbols(createdAt).length > 0) {
    where.createdAt = createdAt;
  }

  // Status — only where the component has a status column
  if (q.status !== undefined && q.status !== '') {
    const fieldTypes =
      opts.fieldTypes ||
      require('./component-registry').getFieldTypes(componentKey);
    if (!Object.prototype.hasOwnProperty.call(fieldTypes, 'status')) {
      throw new ReportingFilterError(
        'unsupported_status_filter',
        `The '${componentKey}' report has no status field to filter on`,
        'status',
        'Remove the status parameter for this endpoint'
      );
    }
    where.status = q.status;
  }

  return { where, include };
}

/**
 * Sends a ReportingFilterError as an HTTP 400 with the agreed body shape.
 * Re-throws anything that is not a ReportingFilterError so the caller can 500.
 */
function respondFilterError(res, err) {
  if (!(err instanceof ReportingFilterError)) throw err;
  return res.status(400).json({
    error: {
      code: err.code,
      message: err.message,
      param: err.param,
      hint: err.hint,
    },
  });
}

module.exports = {
  buildReportingWhere,
  respondFilterError,
  parseDateParam,
  ReportingFilterError,
  KNOWN_PARAMS,
};
