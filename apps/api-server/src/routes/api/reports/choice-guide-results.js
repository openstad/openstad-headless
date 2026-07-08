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
 * The opted-in answer keys for this project — project-wide per key, see the
 * SCOPE note in models/lib/project-config.js.
 *
 * @param {import('express').Request} req
 * @returns {string[]}
 */
function getEnabledAnswerFields(req) {
  const dataScope =
    req.project && req.project.config && req.project.config.dataScope;
  const choiceguidesScope = dataScope && dataScope.choiceguides;
  return (choiceguidesScope && choiceguidesScope.answerFields) || [];
}

/**
 * @param {object} plainRow - a plain ChoicesGuideResult row with the `widget` include
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
 * /choice-guide-results:
 *   get:
 *     summary: List choice-guide results, with answers flattened per opted-in field
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *       - name: widgetId
 *         in: query
 *         required: false
 *         schema: { type: string }
 *         description: Restricts to results on one guide. Omit to union across every guide.
 *     responses:
 *       200:
 *         description: A page of choice-guide results.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/choice-guide-results
//
// Reuses the existing `choiceguides` component (ChoicesGuideResult) — same
// safeFields (id, projectId, widgetId, createdAt, updatedAt, isSpam) as the
// legacy /stats /choicesguides path. `widgetId` is the join key back to
// /reports/choice-guides and /reports/choice-guide-questions — there is no
// real `choicesGuideId` in this schema (verified: ChoicesGuideResult has no
// such column; see report-data-scope.js's `choiceguideguides` comment), so
// it is NOT fabricated here.
//
// `result` (the answers blob) is flattened into answer_<fieldKey> columns
// exactly like #440's submissions: reuses flattenSubmission with the
// `answer_` prefix, gated by the separate dataScope.choiceguides.answerFields
// per-field opt-in, injected AFTER the field filter via extraColumns +
// report-finalize.
module.exports = makeReportEndpoint({
  componentKey: 'choiceguides',
  model: 'ChoicesGuideResult',
  include: [{ model: db.Widget, attributes: ['id', 'type', 'config'] }],
  baseWhere: (req) => {
    const widgetId = req.query.widgetId;
    return widgetId !== undefined && widgetId !== '' ? { widgetId } : {};
  },
  extraColumns: (row, req, allRows) => {
    const enabledAnswerFields = getEnabledAnswerFields(req);

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

    return flattenSubmission(
      row.result,
      unionItems,
      enabledAnswerFields,
      'answer_'
    );
  },
});
