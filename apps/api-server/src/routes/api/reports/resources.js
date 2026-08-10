'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

// GET /api/project/:projectId/reports/resources
module.exports = makeReportEndpoint({
  componentKey: 'resources',
  model: 'Resource',
});
