'use strict';

const { z } = require('zod');

/**
 * Shared zod parameter schemas, mirroring the reporting API's own shared
 * OpenAPI parameters (apps/api-server/src/lib/reporting/openapi/components.js)
 * so a tool's inputSchema documents the same constraints the API enforces.
 */

const dateFrom = z
  .string()
  .optional()
  .describe(
    "Half-open range start (inclusive) on createdAt, UTC. 'YYYY-MM-DD' or full ISO-8601."
  );

const dateTo = z
  .string()
  .optional()
  .describe(
    "Half-open range end (exclusive) on createdAt, UTC. 'YYYY-MM-DD' or full ISO-8601."
  );

const status = z
  .string()
  .optional()
  .describe(
    'Filters by status. Only supported by endpoints whose underlying data has a status field.'
  );

const page = z
  .number()
  .int()
  .min(1)
  .optional()
  .describe('1-based page number.');

// Deliberately lower than the reporting API's own default (100): bounds how
// much a single tool call can add to the model's context window.
const pageSize = z
  .number()
  .int()
  .min(1)
  .max(1000)
  .optional()
  .describe(
    'Rows per page. Defaults to 20 for this tool (lower than the raw API default of 100).'
  );

const widgetIdOptional = z
  .string()
  .optional()
  .describe('Restrict to one form/guide widget. Omit to include every widget.');

const widgetIdRequired = z
  .string()
  .describe('The form/widget to describe fields for.');

module.exports = {
  dateFrom,
  dateTo,
  status,
  page,
  pageSize,
  widgetIdOptional,
  widgetIdRequired,
};
