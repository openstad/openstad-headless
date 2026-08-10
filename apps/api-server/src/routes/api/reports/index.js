'use strict';

const express = require('express');
const requireReportingToken = require('../../../middleware/require-reporting-token');

// Reporting router — mounted at /api/project/:projectId/reports (see
// routes/api/index.js). mergeParams so req.params.projectId is available; the
// project middleware sets req.project, and the (globally mounted)
// api-token-scope-guard + report-field-filter + report-finalize handle
// reporting-token access control, PII stripping and envelope finalization.
const router = express.Router({ mergeParams: true });

// Fail-closed authentication gate: the globally-mounted reporting middleware
// only CONSTRAINS a valid reporting token (they no-op when apiTokenScope is not
// 'reports'), they never REQUIRE one. Without this gate the handlers below —
// which have no auth of their own — would answer no-token / invalid-token
// requests with 200 + real data. requireReportingToken 401s anything that did
// not resolve a valid osr_ reporting token in getUser (user.js).
router.use(requireReportingToken);

// Simple per-datatype endpoints (issue #1651).
router.get('/resources', require('./resources'));
router.get('/votes', require('./votes'));
router.get('/comments', require('./comments'));
router.get('/enquiries', require('./enquiries'));
router.get('/projects', require('./projects'));

// /submissions/fields MUST be mounted before /submissions so Express routes
// the more specific path first (#440).
router.get('/submissions/fields', require('./submissions-fields'));
router.get('/submissions', require('./submissions'));

// Choice guides (#441).
router.get('/choice-guides', require('./choice-guides'));
router.get('/choice-guide-questions', require('./choice-guide-questions'));
router.get('/choice-guide-results', require('./choice-guide-results'));

// Deferred to other tickets, mounted here when built:
//   /users/anonymized, /users/aggregates         → #442

module.exports = router;
