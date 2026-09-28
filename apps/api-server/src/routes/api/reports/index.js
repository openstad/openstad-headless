'use strict';

const express = require('express');
const requireReportingToken = require('../../../middleware/require-reporting-token');
const { problemJsonWrapper } = require('../../../lib/reporting/problem-json');
const { API_VERSION } = require('../../../lib/reporting/api-version');

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
// shape before they can request a reporting token for it. A request that DOES
// carry a valid reporting token reaches the spec too: api-token-scope-guard
// allows it via its SPEC_SEGMENT branch (no project data here to scope, so it
// does not depend on dataScope), and openapi.js sets req.reportSchemaResponse
// so report-field-filter passes the document through instead of screening it
// as an aggregate payload. Both matter — every real client (Power BI, Swagger
// UI, generated SDKs) sends Authorization on every request.
//
// Access-Control-Allow-Origin is hardcoded to '*' here specifically (not left
// to the app-wide, allowlist-based security-headers.js middleware) because
// the ADR requires the spec itself to be fetchable cross-origin by any tool —
// unlike every other reporting response, this one carries no per-project data
// to protect, so a wildcard is safe precisely because it's this narrow. Must
// also clear Access-Control-Allow-Credentials (set unconditionally to 'true'
// by the globally-mounted security-headers.js) — the Fetch/CORS spec forbids
// combining a wildcard origin with credentials:true, and browsers reject the
// response outright for any client that fetches with credentials included.
router.get(
  '/openapi.json',
  (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.removeHeader('Access-Control-Allow-Credentials');
    next();
  },
  require('./openapi')
);

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
