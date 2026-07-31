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
 * One instance belongs to one Openstad installation (config.apiBaseUrl binds
 * it to a single api-server) and serves every project within it: it holds no
 * reporting credentials of its own. Every /mcp request carries its own
 * reporting bearer token (Authorization header) and project id
 * (X-Reporting-Project-Id header), which are extracted per request and used
 * to build a request-scoped config — so concurrent requests for different
 * projects never share state.
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

    // Registered before anything is created, not in a finally after
    // handleRequest: LLM clients cancel tool calls routinely, and an aborted
    // request fires 'close' while handleRequest is still awaiting — a
    // listener added afterwards would never run and leak the per-request
    // McpServer/transport pair. Both bindings are assigned synchronously
    // below, so the closure always sees them by the time 'close' can fire.
    // Both close() calls return promises; a rejection inside an event
    // listener has no caller to catch it and would take the process down.
    res.on('close', () => {
      Promise.all([transport?.close(), server?.close()]).catch((err) => {
        console.error('Error closing MCP request scope:', err);
      });
    });

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
