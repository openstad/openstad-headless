'use strict';

const db = require('../../../db');
const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

// GET /api/project/:projectId/reports/enquiries
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
