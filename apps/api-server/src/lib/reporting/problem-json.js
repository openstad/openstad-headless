'use strict';

/**
 * problem-json — RFC 9457 (application/problem+json) error bodies for the
 * reporting API (NLgov API Design Rules require this shape for every error
 * response, not ad-hoc JSON).
 *
 * The reporting pipeline produces error bodies from four independent places,
 * each with its own plain-JSON shape:
 *   - ReportingFilterError (400s, filters.js)
 *   - the reporting-token 401 (require-reporting-token.js)
 *   - the scope-guard 403s (api-token-scope-guard.js)
 *   - the app-wide error_handling.js 500 (mounted globally in Server.js,
 *     outside routes/api/reports/ — cannot be edited directly without
 *     affecting every non-reporting endpoint too)
 *
 * The first three call sendProblem()/buildProblem() directly. The fourth is
 * caught by problemJsonWrapper, a res.json monkey-patch installed as the
 * first router.use in routes/api/reports/index.js — the same idiom already
 * used by report-finalize.js and report-field-filter.js.
 */

const PROBLEM_TYPE_BASE =
  'https://developer.overheid.nl/api-design-rules/problem';

/**
 * @param {number} status
 * @param {{title: string, detail?: string, type?: string, [key: string]: any}} fields
 * @returns {object} RFC 9457 problem body
 */
function buildProblem(status, { title, detail, type, ...extensions } = {}) {
  return {
    type: type || `${PROBLEM_TYPE_BASE}/${status}`,
    title,
    status,
    ...(detail !== undefined ? { detail } : {}),
    ...extensions,
  };
}

/**
 * Builds a problem body from a ReportingFilterError (filters.js) — reuses its
 * existing code/message/param/hint fields rather than inventing new ones.
 * @param {import('./filters').ReportingFilterError} err
 */
function fromFilterError(err) {
  return buildProblem(400, {
    title: err.message,
    detail: err.hint,
    code: err.code,
    param: err.param,
  });
}

/**
 * Builds a problem body for multiple independent ReportingFilterErrors at
 * once (filters.js's ReportingValidationErrors) — NLgov API Design Rules
 * require every validation error to be reported together in a single
 * response, not one-at-a-time across repeated requests. `errors` is a
 * problem+json extension member (not part of RFC 9457 core, but a widely
 * used convention for surfacing a list of sub-problems).
 * @param {import('./filters').ReportingFilterError[]} errors
 */
function fromFilterErrors(errors) {
  return buildProblem(400, {
    title: 'Multiple validation errors',
    errors: errors.map((err) => ({
      code: err.code,
      title: err.message,
      param: err.param,
      detail: err.hint,
    })),
  });
}

/**
 * Builds a problem body from a plain `{ error: string }` shape, as currently
 * produced by require-reporting-token.js (401) and api-token-scope-guard.js
 * (403).
 * @param {number} status
 * @param {string} message
 */
function fromPlainError(status, message) {
  return buildProblem(status, { title: message });
}

/**
 * Builds a problem body from the app-wide error_handling.js shape.
 *
 * `friendlyStatus` is frequently `undefined` in practice — error_handling.js
 * derives it via `statuses[status]`, but the installed `statuses` package
 * version exposes status text via `statuses.message[status]` instead, so
 * `statuses[500]` etc. resolve to `undefined` (a pre-existing bug in
 * error_handling.js, outside this reporting-only change's scope; confirmed
 * live — every 500 in this repo currently has no friendlyStatus). Falls back
 * to `message` as the title in that case, without duplicating it into detail.
 * @param {{status: number, friendlyStatus?: string, message: string, errorStack: string}} body
 */
function fromAppError({ status, friendlyStatus, message, errorStack }) {
  return buildProblem(status, {
    title: friendlyStatus || message,
    ...(friendlyStatus ? { detail: message } : {}),
    ...(errorStack ? { errorStack } : {}),
  });
}

/**
 * Sends an already-built problem body on `res` with the correct status and
 * content-type.
 * @param {import('express').Response} res
 * @param {number} status
 * @param {object} body
 */
function sendProblem(res, status, body) {
  res.status(status);
  res.set('Content-Type', 'application/problem+json');
  return res.json(body);
}

/**
 * Narrow fingerprint for error_handling.js's response shape. Does NOT require
 * `friendlyStatus` — confirmed live that it's routinely absent (see
 * fromAppError's comment) since JSON.stringify drops an `undefined` value, so
 * requiring it as a string would make this never match in practice. `status`
 * + `message` + `errorStack` together (with `status` a number) is still a
 * distinctive-enough marker: no 2xx reporting payload or problem+json body
 * built by sendProblem ever carries an `errorStack` key. Anything that
 * doesn't match is left untouched.
 * @param {any} payload
 */
function isAppErrorShape(payload) {
  return (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    typeof payload.status === 'number' &&
    'message' in payload &&
    'errorStack' in payload
  );
}

/**
 * Express middleware: monkey-patches res.json so any response later sent by
 * the app-wide error_handling.js handler (mounted outside routes/api/reports/,
 * so it can't be edited directly here) is reshaped into problem+json too.
 * Must be the first router.use in routes/api/reports/index.js so it wraps
 * res.json before anything else in the chain.
 */
function problemJsonWrapper(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function problemJson(payload) {
    if (res.statusCode >= 400 && isAppErrorShape(payload)) {
      res.set('Content-Type', 'application/problem+json');
      return originalJson(fromAppError(payload));
    }
    return originalJson(payload);
  };

  return next();
}

module.exports = {
  buildProblem,
  fromFilterError,
  fromFilterErrors,
  fromPlainError,
  fromAppError,
  sendProblem,
  problemJsonWrapper,
};
