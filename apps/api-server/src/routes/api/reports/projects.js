'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

/**
 * @openapi
 * /projects:
 *   get:
 *     summary: Get the token's own project
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: The project row this token is scoped to.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/projects
// Returns the token's own project row (path-scoped by id via buildReportingWhere).
// includeUserId:false — projects have no participant user.
module.exports = makeReportEndpoint({
  componentKey: 'projects',
  model: 'Project',
  includeUserId: false,
});
