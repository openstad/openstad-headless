'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

/**
 * @openapi
 * /votes:
 *   get:
 *     summary: List votes
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: A page of votes.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/votes
// voteId is exposed as an explicit relationship id (== the vote's own id, issue
// #1648); it is added AFTER the field filter via report-finalize (extraColumns).
module.exports = makeReportEndpoint({
  componentKey: 'votes',
  model: 'Vote',
  extraColumns: (row) => ({ voteId: row.id }),
});
