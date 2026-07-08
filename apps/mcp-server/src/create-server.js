'use strict';

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { TOOLS } = require('./tools/definitions');

/**
 * Builds an McpServer with every reporting tool registered, bound to the
 * given (server-held) config. The LLM client only ever sees tool names,
 * descriptions and parameters — never `config.reportingToken`.
 * @param {{apiBaseUrl: string, projectId: string, reportingToken: string}} config
 */
function createServer(config) {
  const server = new McpServer({
    name: 'openstad-reporting-mcp-server',
    version: '1.0.0',
  });

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema },
      (args) => tool.handler(config, args)
    );
  }

  return server;
}

module.exports = { createServer };
