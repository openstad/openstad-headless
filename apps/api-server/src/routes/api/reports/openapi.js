'use strict';

const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const { definition } = require('../../../lib/reporting/openapi/components');

// Built once at require-time: the spec describes the API's shape, not
// per-project data, so there is nothing to recompute per request. Scans every
// *.js file in this directory for @openapi JSDoc blocks (this file has none).
const spec = swaggerJsdoc({
  definition,
  apis: [path.join(__dirname, '*.js')],
});

/**
 * GET /openapi.json — deliberately mounted BEFORE requireReportingToken in
 * reports/index.js: the spec is documentation, not reporting data, and an
 * integrator needs to be able to read the API shape before they can request a
 * reporting token for it. NLgov API Design Rules require this at a fixed,
 * unauthenticated location.
 */
module.exports = function openapiSpec(req, res) {
  res.json(spec);
};
