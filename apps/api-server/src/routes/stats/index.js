const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const apiTokenScopeGuard = require('../../middleware/api-token-scope-guard');
const reportFieldFilter = require('../../middleware/report-field-filter');

let router = express.Router({ mergeParams: true });

// brute force
router.use(bruteForce.globalMiddleware);
router.post('*', bruteForce.postMiddleware);

// Reporting-token scope guard (no-op for regular users) must run before routes.
router.use(apiTokenScopeGuard);
// Field filter wraps res.json for reporting tokens; must run after the guard.
router.use(reportFieldFilter);

// vote
router.use('/project/:projectId(\\d+)/vote', require('./vote'));

// resource
router.use('/project/:projectId(\\d+)/resource', require('./resource'));

// comment
router.use('/project/:projectId(\\d+)/comment', require('./comment'));

// choicesguide
router.use(
  '/project/:projectId(\\d+)/choicesguides',
  require('./choicesguide')
);

// get overview of stats
router.use('/project/:projectId(\\d+)/overview', require('./overview'));

module.exports = router;
