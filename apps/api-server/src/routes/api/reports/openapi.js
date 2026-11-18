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
  // The spec is a schema document, not participant data — same flag
  // submissions-fields.js uses, so report-field-filter passes it through
  // instead of screening it as an aggregate payload (which it is not).
  // Only relevant when the request carries a reporting token; harmless
  // otherwise, since the filter no-ops for every other request.
  req.reportSchemaResponse = true;
  res.json(spec);
};
