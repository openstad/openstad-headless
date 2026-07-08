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

// GET /api/project/:projectId/reports/submissions
//
// Optional ?widgetId= restricts to one form, giving a strict single-form
// schema (recommended for Power BI). Without it, submissions across
// multiple forms are unioned: every row on the page exposes the union of
// field_<key> columns seen on that page (null where its own form doesn't
// define that key) — flattenSubmission already returns null for any form
// item whose key is absent from a given row's submittedData, so passing the
// page-wide union of items as the "form definition" gives consistent
// schema for free (#440 AC: consistent schema, empty fields as null).
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
