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
 * @param {{host: string, port: number, authToken?: string, [key: string]: any}} config
 */
function createApp(config) {
  const app = createMcpExpressApp({ host: config.host });

  // Shared-secret auth on /mcp: required by loadConfig() whenever
  // config.host isn't localhost, optional (but still enforced if set) on
  // localhost. Without this, anyone who can reach the port could invoke
  // every reporting tool using this process's held bearer token with no
  // credential of their own.
  app.use('/mcp', (req, res, next) => {
    if (!config.authToken) return next();
    const header = req.get('Authorization') || '';
    if (header === `Bearer ${config.authToken}`) return next();
    return res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Unauthorized' },
      id: null,
    });
  });

  // Stateless mode: a fresh McpServer + transport per request, so one process
  // can serve concurrent tool calls without shared session state — this
  // server is a thin, stateless protocol adapter over the reporting API,
  // nothing here needs to persist across requests.
  app.post('/mcp', async (req, res) => {
    let transport;
    let server;
    try {
      server = createServer(config);
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
