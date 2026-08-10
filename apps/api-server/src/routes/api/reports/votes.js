'use strict';

const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');

// GET /api/project/:projectId/reports/votes
// voteId is exposed as an explicit relationship id (== the vote's own id, issue
// #1648); it is added AFTER the field filter via report-finalize (extraColumns).
module.exports = makeReportEndpoint({
  componentKey: 'votes',
  model: 'Vote',
  extraColumns: (row) => ({ voteId: row.id }),
});
