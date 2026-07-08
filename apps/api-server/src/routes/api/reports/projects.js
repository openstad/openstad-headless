'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

// GET /api/project/:projectId/reports/projects
// Returns the token's own project row (path-scoped by id via buildReportingWhere).
// includeUserId:false — projects have no participant user.
module.exports = makeReportEndpoint({
  componentKey: 'projects',
  model: 'Project',
  includeUserId: false,
});
