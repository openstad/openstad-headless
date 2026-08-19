'use strict';

/**
 * Thin HTTP client for the reporting API. The MCP layer stays deliberately
 * dumb: PII scoping and field-filtering already happen server-side in
 * api-server (report-field-filter.js, api-token-scope-guard.js) — this client
 * does not duplicate any of that, it only injects the bearer token and
 * forwards query params.
 */

/**
 * @param {string} baseUrl
 * @param {string} projectId
 * @param {string} path - e.g. '/resources', leading slash required
 * @param {Record<string, any>} params
 * @returns {URL}
 */
function buildUrl(baseUrl, projectId, path, params) {
  const url = new URL(`/api/project/${projectId}/reports/v1${path}`, baseUrl);
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url;
}

/**
 * Builds a human-readable message from an application/problem+json body (see
 * apps/api-server's lib/reporting/problem-json.js), folding in `detail` and,
 * for the multi-error case, every sub-error's title/param/detail. The MCP
 * SDK's tool-error path only ever surfaces `Error.message` to the LLM (it
 * does not read arbitrary properties off the thrown error) — so anything not
 * folded into the message text here is invisible to the model.
 * @param {object} problem
 * @param {number} status
 */
function messageFromProblem(problem, status) {
  if (!problem || typeof problem !== 'object') {
    return `Reporting API request failed with status ${status}`;
  }
  if (Array.isArray(problem.errors) && problem.errors.length > 0) {
    const parts = problem.errors.map((e) =>
      [e.param, [e.title, e.detail].filter(Boolean).join(' — ')]
        .filter(Boolean)
        .join(': ')
    );
    return `${problem.title || 'Multiple validation errors'}: ${parts.join('; ')}`;
  }
  return (
    [problem.title, problem.detail].filter(Boolean).join(' — ') ||
    `Reporting API request failed with status ${status}`
  );
}

/**
 * Calls one reporting endpoint and returns its parsed JSON body.
 * Throws on a non-2xx response, with a message built from the full
 * application/problem+json body (see messageFromProblem) so the LLM sees the
 * real, actionable reason — not just a generic title. `.status` and
 * `.problem` are still attached for any caller that wants the raw body.
 *
 * @param {{apiBaseUrl: string, projectId: string, reportingToken: string}} config
 * @param {string} path
 * @param {Record<string, any>} [params]
 */
async function fetchReportingData(config, path, params) {
  const url = buildUrl(config.apiBaseUrl, config.projectId, path, params);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${config.reportingToken}` },
  });

  // Not every failure comes from the reporting API itself — a proxy or
  // ingress in front of it answers with an HTML error page, and parsing that
  // as JSON would throw a SyntaxError that hides the real status from the
  // LLM. Parse defensively and let messageFromProblem fall back to the status.
  let body;
  try {
    body = await res.json();
  } catch {
    if (res.ok) {
      const err = new Error(
        `Reporting API returned a non-JSON body with status ${res.status}`
      );
      err.status = res.status;
      throw err;
    }
    body = null;
  }

  if (!res.ok) {
    const err = new Error(messageFromProblem(body, res.status));
    err.status = res.status;
    err.problem = body;
    throw err;
  }

  return body;
}

module.exports = { buildUrl, fetchReportingData };
