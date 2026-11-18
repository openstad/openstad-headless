'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

/**
 * @openapi
 * /choice-guides:
 *   get:
 *     summary: List choice-guide definitions
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: A page of choice-guide definitions.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/choice-guides
//
// Guide-definition metadata (#441). Backed by the Widget model
// (type='choiceguide') rather than the ChoicesGuide table — see
// packages/lib/report-data-scope.js's `choiceguideguides` comment for why:
// ChoicesGuide/ChoicesGuideQuestion(Group) are unused/disconnected in this
// codebase (no admin UI, empty tables, no real choicesGuideId column on
// results). `id` here is the widget's own id — the same id
// choice-guide-results exposes as `widgetId` — so the two endpoints join on
// that shared id (in place of the plan's assumed choicesGuideId).
//
// `description` serves as the guide's display name (safeFields, see
// report-data-scope) — Widget has no separate `title` column, and
// Widget.description is the admin-facing guide name (already used this way
// by the existing GET /choicesguide/widgets admin route). The widget's own
// config (introTitle/introDescription) is a free-form JSON blob and stays
// out of safeFields, same treatment as every other component's `config`.
module.exports = makeReportEndpoint({
  componentKey: 'choiceguideguides',
  model: 'Widget',
  baseWhere: () => ({ type: 'choiceguide' }),
  includeUserId: false, // Widget has no participant user
});
