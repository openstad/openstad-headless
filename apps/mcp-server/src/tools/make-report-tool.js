'use strict';

const { fetchReportingData } = require('../reporting-client');

// Lower than the reporting API's own default of 100 (see paginate.js) — a
// tool result becomes part of the model's context, so a smaller default page
// keeps a single call from dumping an oversized blob into that context.
const DEFAULT_MCP_PAGE_SIZE = 20;

/**
 * Builds one MCP tool registration for a single reporting endpoint. Mirrors
 * apps/api-server's make-report-endpoint.js factory pattern: one shared
 * implementation, per-endpoint config, instead of 12 near-identical tool
 * handlers. The SDK validates `args` against `inputSchema` before invoking
 * this handler, so no manual validation is needed here.
 *
 * @param {{name: string, description: string, path: string, paramsShape?: import('zod').ZodRawShape}} cfg
 * @returns {{name: string, description: string, inputSchema: object, handler: (config: object, args: object) => Promise<object>}}
 */
function makeReportTool({ name, description, path, paramsShape = {} }) {
  return {
    name,
    description,
    inputSchema: paramsShape,
    handler: async (config, args) => {
      const params = { ...args };
      // Only default pageSize for tools that actually declare it — some
      // endpoints (e.g. users/aggregates, submissions/fields) aren't
      // paginated at all, and sending an unsolicited pageSize would be
      // meaningless for them.
      if (
        Object.prototype.hasOwnProperty.call(paramsShape, 'pageSize') &&
        params.pageSize === undefined
      ) {
        params.pageSize = DEFAULT_MCP_PAGE_SIZE;
      }
      const body = await fetchReportingData(config, path, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(body) }],
      };
    },
  };
}

module.exports = { makeReportTool, DEFAULT_MCP_PAGE_SIZE };
