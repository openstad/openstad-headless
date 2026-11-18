'use strict';

/**
 * Server-startup configuration for the reporting MCP server. apiBaseUrl binds
 * one instance to one Openstad installation's api-server; within it the
 * process is shared across every project and holds no reporting credentials
 * of its own. Each request carries its own reporting bearer token and project
 * id (extracted per-request in create-app.js), so an LLM client can only
 * ever ask for data that request's own token already scopes it to.
 */

// Node's listen() accepts an integer in [0, 65535]; anything else is a
// RangeError, which would crash the server at startup instead of using the
// default. Verified: both 3900.5 and 99999 throw
// "options.port should be >= 0 and < 65536".
const MAX_PORT = 65535;

/**
 * Parses a port number, treating 0 as a valid explicit value (the standard
 * "let the OS assign a free port" convention) rather than falling back to the
 * default — a plain `Number(x) || default` would incorrectly treat 0 as unset.
 *
 * Anything that is not an integer in the valid TCP range falls back to the
 * default rather than reaching listen(): a typo in MCP_PORT should not take the
 * server down.
 */
function parsePort(value, fallback) {
  if (value === undefined) return fallback;
  // Trimmed first: Number(' ') is 0, so an all-whitespace MCP_PORT would
  // otherwise read as the explicit "pick a random free port" value.
  const trimmed = String(value).trim();
  if (trimmed === '') return fallback;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 0 || n > MAX_PORT) return fallback;
  return n;
}

/**
 * Host names this server accepts in the Host header, as a comma-separated
 * list. The MCP SDK applies DNS-rebinding protection automatically only when
 * bound to localhost; binding to 0.0.0.0 — which any container deployment
 * needs — drops it for a bare console warning. Setting this restores host
 * validation for that case. Empty means "keep the SDK's default behaviour".
 */
function parseAllowedHosts(value) {
  if (!value) return undefined;
  const hosts = value
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  return hosts.length > 0 ? hosts : undefined;
}

function loadConfig(env = process.env) {
  return {
    apiBaseUrl: env.MCP_REPORTING_API_BASE_URL || 'http://localhost:31410',
    host: env.MCP_HOST || '127.0.0.1',
    allowedHosts: parseAllowedHosts(env.MCP_ALLOWED_HOSTS),
    port: parsePort(env.MCP_PORT, 3900),
  };
}

module.exports = { loadConfig };
