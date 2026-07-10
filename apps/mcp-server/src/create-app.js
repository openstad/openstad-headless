'use strict';

const {
  StreamableHTTPServerTransport,
} = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const {
  createMcpExpressApp,
} = require('@modelcontextprotocol/sdk/server/express.js');
const { createServer } = require('./create-server');

/**
 * Builds the Express app for the reporting MCP server. Separated from
 * server.js's process bootstrap (dotenv, app.listen) so it can be exercised
 * with supertest without opening a real network listener.
 *
 * This server is shared and multi-tenant: it holds no reporting credentials
 * of its own. Every /mcp request carries its own reporting bearer token
 * (Authorization header) and project id (X-Reporting-Project-Id header),
 * which are extracted per request and used to build a request-scoped config
 * — so concurrent requests for different municipalities never share state.
 * @param {{apiBaseUrl: string, host: string, port: number}} config
 */
function createApp(config) {
  const app = createMcpExpressApp({ host: config.host });

  // Stateless mode: a fresh McpServer + transport per request, so one process
  // can serve concurrent tool calls without shared session state — this
  // server is a thin, stateless protocol adapter over the reporting API,
  // nothing here needs to persist across requests.
  app.post('/mcp', async (req, res) => {
    let transport;
    let server;
    try {
      const authHeader = req.get('Authorization') || '';
      const reportingToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : undefined;
      // Only accept a plain numeric project id — this value is interpolated
      // into the outbound reporting API URL path (reporting-client.js's
      // buildUrl), so anything else (e.g. `../..`) is treated as absent
      // rather than passed through and risking a path-prefix rewrite.
      const rawProjectId = req.get('X-Reporting-Project-Id') || '';
      const projectId = /^\d+$/.test(rawProjectId) ? rawProjectId : undefined;

      // Missing/invalid credentials are not rejected here — the tool layer
      // (make-report-tool.js) returns an MCP tool error per call instead, so
      // the failure surfaces in the LLM UI rather than as a bare HTTP error.
      const requestConfig = { ...config, reportingToken, projectId };

      server = createServer(requestConfig);
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('Error handling MCP request:', err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    } finally {
      // Registered on every path (success, thrown error) so a request that
      // throws inside handleRequest still cleans up the per-request
      // McpServer/transport pair instead of leaking them.
      res.on('close', () => {
        transport?.close();
        server?.close();
      });
    }
  });

  app.get('/mcp', (req, res) => {
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      })
    );
  });

  return app;
}

module.exports = { createApp };
