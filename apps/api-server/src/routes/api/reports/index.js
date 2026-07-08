'use strict';

const express = require('express');
const requireReportingToken = require('../../../middleware/require-reporting-token');
const { problemJsonWrapper } = require('../../../lib/reporting/problem-json');

const API_VERSION = '1.0.0';

// Reporting router — mounted at /api/project/:projectId/reports/v1 (see
// routes/api/index.js). mergeParams so req.params.projectId is available; the
// project middleware sets req.project, and the (globally mounted)
// api-token-scope-guard + report-field-filter + report-finalize handle
// reporting-token access control, PII stripping and envelope finalization.
const router = express.Router({ mergeParams: true });

// NLgov API Design Rules: every error response must be application/problem+json
// (RFC 9457). Must be the FIRST router.use — it monkey-patches res.json so it
// also catches the app-wide error_handling.js 500 (mounted outside this router
// entirely, so it can't be edited directly here without affecting every
// non-reporting endpoint too). filters.js, require-reporting-token.js and
// api-token-scope-guard.js already send RFC 9457 bodies directly.
router.use(problemJsonWrapper);

// NLgov API Design Rules: the major version must be reflected in a response
// header too, not just the URI.
router.use((req, res, next) => {
  res.set('API-Version', API_VERSION);
  next();
});

// NLgov API Design Rules: publish OpenAPI 3.x at a fixed location. Mounted
// BEFORE the auth gate below — an integrator must be able to read the API
// shape before they can request a reporting token for it. (A request that
// DOES carry a valid reporting token still 403s here via the globally-mounted
// api-token-scope-guard, since /openapi.json matches no known reporting
// component — a narrow, documented edge case, not a security gap: the spec
// stays reachable for the unauthenticated case that matters.)
router.get('/openapi.json', require('./openapi'));

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

// Anonymized user data (#442).
router.get('/users/anonymized', require('./users-anonymized'));
router.get('/users/aggregates', require('./users-aggregates'));

module.exports = router;
