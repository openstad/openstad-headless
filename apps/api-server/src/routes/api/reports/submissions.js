'use strict';

const db = require('../../../db');
const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');
const {
  flattenSubmission,
  fieldKeyOf,
} = require('../../../lib/reporting/flatten-submission');
const { parseWidgetId } = require('../../../lib/reporting/parse-widget-id');

/**
 * The opted-in form-field keys for this project — project-wide per fieldKey,
 * see the SCOPE note in models/lib/project-config.js.
 *
 * @param {import('express').Request} req
 * @returns {string[]}
 */
function getEnabledFormFields(req) {
  const dataScope =
    req.project && req.project.config && req.project.config.dataScope;
  const submissionsScope = dataScope && dataScope.submissions;
  return (submissionsScope && submissionsScope.formFields) || [];
}

/**
 * @param {object} plainRow - a plain Submission row with the `widget` include
 * @returns {Array<object>}
 */
function widgetItemsOf(plainRow) {
  const items =
    plainRow && plainRow.widget && plainRow.widget.config
      ? plainRow.widget.config.items
      : undefined;
  return Array.isArray(items) ? items : [];
}

/**
 * The de-duplicated form items across every row on the page, in first-seen
 * order — the "form definition" the whole page is flattened against.
 *
 * @param {Array<object>} plainRows
 * @returns {Array<object>}
 */
function unionFormItems(plainRows) {
  const unionItems = [];
  const seenKeys = new Set();
  for (const row of plainRows) {
    for (const item of widgetItemsOf(row)) {
      const key = fieldKeyOf(item);
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        unionItems.push(item);
      }
    }
  }
  return unionItems;
}

/**
 * Page-wide values every row's extraColumns needs, computed ONCE per request.
 *
 * extraColumns is invoked per row (paginate.js), so deriving the union inside it
 * would re-scan the whole page for every row — O(rows × rows × items) per
 * request, which at the 1000-row max page size is exactly the work
 * paginateReporting's `allPlainRows` argument exists to avoid. Safe to memoise
 * on req: paginateReporting has a single call site (make-report-endpoint.js) and
 * builds allPlainRows once per handler run, so every call within one request
 * sees the same array.
 *
 * @param {import('express').Request} req
 * @param {Array<object>} allPlainRows
 * @returns {{unionItems: Array<object>, enabledFieldKeys: string[]}}
 */
function pageContext(req, allPlainRows) {
  if (!req._reportSubmissionsPageContext) {
    req._reportSubmissionsPageContext = {
      unionItems: unionFormItems(allPlainRows),
      enabledFieldKeys: getEnabledFormFields(req),
    };
  }
  return req._reportSubmissionsPageContext;
}

// Throwing a ReportingFilterError here is turned into the standard 400 body by
// make-report-endpoint's respondFilterError.
const baseWhere = (req) => {
  const widgetId = parseWidgetId(req.query.widgetId);
  return widgetId !== undefined ? { widgetId } : {};
};

const extraColumns = (row, req, allRows) => {
  // Only the page-wide context is memoised. A caller that passes no allRows
  // gets this row's own items, uncached — caching a single-row union would hand
  // it to every later row too and silently drop their field_<key> columns.
  const { unionItems, enabledFieldKeys } = allRows
    ? pageContext(req, allRows)
    : {
        unionItems: unionFormItems([row]),
        enabledFieldKeys: getEnabledFormFields(req),
      };
  return flattenSubmission(row.submittedData, unionItems, enabledFieldKeys);
};

/**
 * @openapi
 * /submissions:
 *   get:
 *     summary: List form submissions, with answer fields flattened per opted-in field
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *       - $ref: '#/components/parameters/status'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *       - name: widgetId
 *         in: query
 *         required: false
 *         schema: { type: string }
 *         description: Restricts to submissions on one form/widget. Omit to union across every form.
 *     responses:
 *       200:
 *         description: A page of submissions.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/submissions
//
// Optional ?widgetId= restricts to one form, giving a strict single-form
// schema (recommended for Power BI). Without it, submissions across
// multiple forms are unioned: every row on the page exposes the union of
// field_<key> columns seen on that page (null where its own form doesn't
// define that key) — flattenSubmission already returns null for any form
// item whose key is absent from a given row's submittedData, so passing the
// page-wide union of items as the "form definition" gives consistent
// schema for free (#440 AC: consistent schema, empty fields as null).
//
// ?widgetId= narrows the ROWS, never the allowlist (project-wide per fieldKey).
// The union is computed per PAGE, so the column set can differ between pages of
// an unfiltered query — pass ?widgetId= when a stable schema matters.
module.exports = makeReportEndpoint({
  componentKey: 'submissions',
  model: 'Submission',
  include: [{ model: db.Widget, attributes: ['id', 'type', 'config'] }],
  baseWhere,
  extraColumns,
});

// Test seams — the endpoint itself needs a DB, these are pure.
module.exports.baseWhere = baseWhere;
module.exports.extraColumns = extraColumns;
module.exports.unionFormItems = unionFormItems;
