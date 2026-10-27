'use strict';

const db = require('../../../db');
const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

/**
 * @openapi
 * /enquiries:
 *   get:
 *     summary: List enquiry submissions (submissions on an enquete widget)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/dateFrom'
 *       - $ref: '#/components/parameters/dateTo'
 *       - $ref: '#/components/parameters/status'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: A page of enquiry submissions.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/enquiries
// ASSUMPTION (documented in the plan): "enquiries" == submissions whose Widget
// has type 'enquete'. Reuses the `submissions` data-scope/fields; the path
// segment `enquiries` is mapped to the `submissions` component in
// report-data-scope SEGMENT_TO_COMPONENT so the scope-guard + field-filter treat
// it as submissions.
module.exports = makeReportEndpoint({
  componentKey: 'submissions',
  model: 'Submission',
  include: [
    {
      model: db.Widget,
      attributes: [],
      where: { type: 'enquete' },
      required: true,
    },
  ],
});
