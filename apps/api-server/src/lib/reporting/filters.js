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

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
// Full datetime, always with an explicit zone: 'Z' or ±HH:MM. A zone-less
// datetime is rejected on purpose — new Date() would read it in the SERVER's
// local timezone, so the same query would cover a different window depending on
// where the api-server runs.
const DATE_TIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

const DATE_HINT =
  'Use YYYY-MM-DD or ISO-8601 with an explicit zone, e.g. 2026-01-01 or 2026-01-01T00:00:00Z';

/**
 * Parses a date param. Accepts a bare 'YYYY-MM-DD' (interpreted as UTC
 * midnight) or an ISO-8601 datetime carrying an explicit zone ('Z' or ±HH:MM),
 * which is normalised to UTC. Throws ReportingFilterError on anything else.
 *
 * Deliberately stricter than `new Date(str)`, which silently accepts values the
 * API does not document and would turn a typo into a wrong result instead of a
 * 400: '01/02/2026' (ambiguous, read in server-local time), 'Jan 5 2026',
 * '2026' and a zone-less '2026-01-01T12:00:00'. It also rolls an impossible
 * calendar date forward — '2026-02-31' becomes 2026-03-03 — so the calendar
 * components are range-checked before the Date is built.
 *
 * @returns {Date}
 */
function parseDateParam(value, param) {
  const fail = (str) => {
    throw new ReportingFilterError(
      'invalid_date',
      `'${param}' is not a valid date: '${str}'`,
      param,
      DATE_HINT
    );
  };

  // A repeated query param arrives as an array, a bracketed one as an object.
  // String() would turn those into 'a,b' / '[object Object]' and report that
  // coerced value back at the client, so reject the shape itself.
  if (typeof value !== 'string') fail(String(value));

  const dateOnly = DATE_ONLY_RE.exec(value);
  const match = dateOnly || DATE_TIME_RE.exec(value);
  if (!match) fail(value);

  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
  // Days in `month`, using day 0 of the next month; Date's own year/month
  // arithmetic handles leap years and the December rollover.
  const daysInMonth = new Date(
    Date.UTC(Number(year), Number(month), 0)
  ).getUTCDate();
  if (
    Number(month) < 1 ||
    Number(month) > 12 ||
    Number(day) < 1 ||
    Number(day) > daysInMonth ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59
  ) {
    fail(value);
  }

  const d = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(d.getTime())) fail(value);
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
 * @param {{fieldTypes?:Record<string,string>, statusEnumValues?:string[]|null}} [opts]
 *   - inject fieldTypes / statusEnumValues to avoid db in tests. statusEnumValues:
 *   undefined looks it up via component-registry, null means "no enum constraint",
 *   an array means "only these values are valid".
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
    // A non-string means the querystring parser turned `status` into an
    // object or array (e.g. ?status[x]=y), not a scalar filter value —
    // reject before it ever reaches Sequelize as a where-clause operand.
    if (typeof q.status !== 'string') {
      throw new ReportingFilterError(
        'invalid_status_type',
        `'status' must be a single string value`,
        'status',
        'Pass status as a plain query string, e.g. ?status=approved'
      );
    }

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

    // Validate against the component's real status set (e.g. Submission's
    // ENUM) when there is one. Components without a fixed enum (free-text,
    // or a per-project status set that isn't a plain column — resources
    // never reach this branch at all, see getFieldEnumValues) skip this
    // check rather than enforce a hardcoded list.
    const allowedStatuses =
      opts.statusEnumValues !== undefined
        ? opts.statusEnumValues
        : require('./component-registry').getFieldEnumValues(
            componentKey,
            'status'
          );
    if (Array.isArray(allowedStatuses) && !allowedStatuses.includes(q.status)) {
      throw new ReportingFilterError(
        'unknown_status',
        `'${q.status}' is not a valid status for the '${componentKey}' report`,
        'status',
        `Valid values: ${allowedStatuses.join(', ')}`
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
