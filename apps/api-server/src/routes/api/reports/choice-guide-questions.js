'use strict';

const db = require('../../../db');
const { fieldKeyOf } = require('../../../lib/reporting/flatten-submission');

/**
 * Flattens a page of choiceguide Widgets into question rows. Pure/DB-free so
 * it can be unit-tested without a real Sequelize connection (mirrors
 * make-report-endpoint.js's resolveCombinedInclude test seam).
 * @param {Array<{id: number|string, config: {items?: any[]}}>} widgets
 * @returns {Array<object>}
 */
function buildQuestionRows(widgets) {
  const data = [];
  for (const widget of widgets || []) {
    const items =
      widget.config && Array.isArray(widget.config.items)
        ? widget.config.items
        : [];
    items.forEach((item, seqnr) => {
      const key = fieldKeyOf(item);
      if (!key) return;
      data.push({
        id: `${widget.id}:${key}`,
        widgetId: widget.id,
        fieldKey: key,
        title: item.title || key,
        type: item.type || item.fieldType || null,
        seqnr,
      });
    });
  }
  return data;
}

/**
 * @openapi
 * /choice-guide-questions:
 *   get:
 *     summary: List choice-guide question rows, flattened from the guide's widget config
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: widgetId
 *         in: query
 *         required: false
 *         schema: { type: string }
 *         description: Restricts to one guide. Omit to flatten every choice-guide in the project.
 *     responses:
 *       200:
 *         description: Question rows (not paginated — bounded by the number of questions per guide).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/choice-guide-questions?widgetId=
//
// Flat guide -> question rows (#441). Not a real DB table — choice-guide
// question definitions live in Widget.config.items (Widget.type='choiceguide'),
// the same place #440 reads submission form definitions from (see
// report-data-scope.js's `choiceguideguides` comment for why the unused
// ChoicesGuide/ChoicesGuideQuestion(Group) models are NOT used here). So,
// unlike the other report endpoints, this one is a custom handler rather than
// makeReportEndpoint: there is no Sequelize model to page through, just a
// small, bounded list of question items per guide widget.
//
// Safe-only (report-data-scope `choiceguidequestions`, no personalFields):
// question titles/types are admin-authored form structure, not participant
// data, so — unlike #440's form ANSWER values — no per-field opt-in gate
// applies here.
//
// Optional ?widgetId= scopes to one guide; otherwise all of the project's
// choiceguide widgets are flattened together.
async function choiceGuideQuestions(req, res, next) {
  try {
    const widgetId = req.query.widgetId;
    const where = { projectId: req.project.id, type: 'choiceguide' };
    if (widgetId !== undefined && widgetId !== '') where.id = widgetId;

    const widgets = await db.Widget.findAll({
      where,
      attributes: ['id', 'config'],
      order: [['id', 'ASC']],
    });

    // report-field-filter's legacy-wrapper branch (componentKey set, not
    // aggregate) rebuilds `{ data, metadata }` from `{ data, nextLink }` and
    // so drops nextLink; report-finalize would normally restore it from
    // req.reportNextLink, but that's only ever set by paginateReporting —
    // which this bespoke (non-makeReportEndpoint) handler never calls. Set it
    // directly (always null: this endpoint never paginates) so report-finalize
    // still reconstructs the usual { data, nextLink } envelope.
    req.reportNextLink = null;
    return res.json({ data: buildQuestionRows(widgets), nextLink: null });
  } catch (err) {
    return next(err);
  }
}

module.exports = choiceGuideQuestions;
module.exports.buildQuestionRows = buildQuestionRows;
