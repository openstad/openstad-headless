'use strict';

/**
 * Server-held configuration for the reporting MCP server. The reporting
 * bearer token and project id live here — never in a tool's input schema —
 * so an LLM client can only ever ask for data the token already scopes it to;
 * the model never sees the credential itself.
 *
 * One MCP server instance == one reporting token == one project, since
 * reporting tokens are already minted per-project (apps/api-server's
 * api-token.js) — this mirrors that constraint rather than adding a new one.
 */

const LOCALHOST_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

/**
 * Parses a port number, treating 0 as a valid explicit value (the standard
 * "let the OS assign a free port" convention) rather than falling back to the
 * default — a plain `Number(x) || default` would incorrectly treat 0 as unset.
 */
function parsePort(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function loadConfig(env = process.env) {
  const reportingToken = env.MCP_REPORTING_API_TOKEN;
  if (!reportingToken) {
    throw new Error(
      'MCP_REPORTING_API_TOKEN is not set — required to authenticate against the reporting API'
    );
  }

  const projectId = env.MCP_REPORTING_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      'MCP_REPORTING_PROJECT_ID is not set — required to scope reporting API requests'
    );
  }

  const host = env.MCP_HOST || '127.0.0.1';
  const authToken = env.MCP_SERVER_AUTH_TOKEN;

  // Binding beyond localhost makes /mcp reachable over the network; requiring
  // an auth token in that case is fail-closed by construction, rather than a
  // security property an operator has to remember to add separately.
  if (!LOCALHOST_HOSTS.has(host) && !authToken) {
    throw new Error(
      `MCP_HOST is set to '${host}' (not localhost) but MCP_SERVER_AUTH_TOKEN is not set — ` +
        'refusing to expose /mcp (and the reporting token it holds) on the network with no authentication.'
    );
  }

  return {
    apiBaseUrl: env.MCP_REPORTING_API_BASE_URL || 'http://localhost:31410',
    reportingToken,
    projectId,
    host,
    authToken,
    port: parsePort(env.MCP_PORT, 3900),
  };
}

module.exports = { loadConfig };
