'use strict';

const db = require('../../../db');
const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');
const {
  flattenSubmission,
  fieldKeyOf,
} = require('../../../lib/reporting/flatten-submission');

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
  baseWhere: (req) => {
    const widgetId = req.query.widgetId;
    return widgetId !== undefined && widgetId !== '' ? { widgetId } : {};
  },
  extraColumns: (row, req, allRows) => {
    const enabledFieldKeys = getEnabledFormFields(req);

    const unionItems = [];
    const seenKeys = new Set();
    for (const r of allRows || [row]) {
      for (const item of widgetItemsOf(r)) {
        const key = fieldKeyOf(item);
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          unionItems.push(item);
        }
      }
    }

    return flattenSubmission(row.submittedData, unionItems, enabledFieldKeys);
  },
});
