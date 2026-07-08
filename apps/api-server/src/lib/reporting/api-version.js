'use strict';

/**
 * The reporting API's major.minor.patch version (NLgov API Design Rules:
 * every response must carry this in an API-Version header, not just the
 * URI's /v1 segment). Shared between routes/api/reports/index.js (sets it on
 * every response reached via that router) and api-token-scope-guard.js
 * (globally mounted BEFORE that router, so its own 403s need the same header
 * set independently — see Server.js's middleware order).
 */
const API_VERSION = '1.0.0';

module.exports = { API_VERSION };
