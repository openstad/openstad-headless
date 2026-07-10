'use strict';

/**
 * Server-startup configuration for the reporting MCP server. The server
 * itself holds no reporting credentials — it is a shared, multi-tenant
 * process; each request carries its own reporting bearer token and project
 * id (extracted per-request in create-app.js), so an LLM client can only
 * ever ask for data that request's own token already scopes it to.
 */

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
  return {
    apiBaseUrl: env.MCP_REPORTING_API_BASE_URL || 'http://localhost:31410',
    host: env.MCP_HOST || '127.0.0.1',
    port: parsePort(env.MCP_PORT, 3900),
  };
}

module.exports = { loadConfig };
