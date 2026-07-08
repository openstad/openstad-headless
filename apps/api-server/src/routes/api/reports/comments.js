'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

// GET /api/project/:projectId/reports/comments
module.exports = makeReportEndpoint({
  componentKey: 'comments',
  model: 'Comment',
});
