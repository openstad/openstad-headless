'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

/**
 * @openapi
 * /resources:
 *   get:
 *     summary: List resources
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: A page of resources.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/resources
module.exports = makeReportEndpoint({
  componentKey: 'resources',
  model: 'Resource',
});
