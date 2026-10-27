'use strict';

const { ReportingFilterError } = require('./filters');

const WIDGET_ID_RE = /^[0-9]+$/;

/**
 * Validates the optional ?widgetId= query param shared by the submissions
 * report and its /fields schema endpoint.
 *
 * Both used to test presence with a bare truthiness check, which accepted
 * anything the querystring parser produced. Express's default `extended` parser
 * turns a repeated `?widgetId=1&widgetId=2` into an array and `?widgetId[a]=1`
 * into an object; both are truthy, so they reached Sequelize as a where-clause
 * operand instead of being rejected:
 *
 *  - A repeated param passes db.js's `typeValidation` (each element is a valid
 *    integer) and really queries `widgetId IN ('1','2')`, widening past the
 *    single form the param promises. On /fields, which resolves the widget with
 *    findOne, that answers 200 with whichever form matched first.
 *  - An object or a non-numeric string trips that same type check during query
 *    generation, so a SequelizeValidationError surfaces as a 500.
 *
 * Either way the caller never learned the parameter was malformed. Values are
 * always parameterised, so none of this was an injection risk — the point is one
 * clear 400 from both endpoints.
 *
 * @param {unknown} value - req.query.widgetId
 * @returns {string|undefined} the id, or undefined when the param is absent
 * @throws {ReportingFilterError} when present but not a scalar numeric id
 */
function parseWidgetId(value) {
  if (value === undefined || value === '') return undefined;

  if (typeof value !== 'string' || !WIDGET_ID_RE.test(value)) {
    throw new ReportingFilterError(
      'invalid_widget_id',
      `'widgetId' must be a single numeric id`,
      'widgetId',
      'Pass one widget id, e.g. ?widgetId=42'
    );
  }

  return value;
}

module.exports = { parseWidgetId };
