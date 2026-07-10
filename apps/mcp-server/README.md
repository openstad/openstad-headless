# Openstad reporting MCP server

Exposes the Openstad reporting API (`/api/project/:projectId/reports/v1/...`) as a curated set of MCP tools, so an LLM client (e.g. Claude Desktop) can query resources, votes, comments, submissions, etc. without the model ever seeing a bearer token.

## Multi-tenant design

This is a single, shared, centrally-hosted server — not one process per municipality. The server holds **no reporting credentials of its own**. Every request to `/mcp` carries its own credentials:

- `Authorization: Bearer <reporting-token>` — the same reporting API token used elsewhere against the Openstad API.
- `X-Reporting-Project-Id: <projectId>` — the id of the project that token was issued for.

Both are required because a reporting token is an opaque string; the server has no database access and cannot look up which project a token belongs to on its own. The reporting API (`apps/api-server`) validates that the token actually matches the given project.

If either header is missing or invalid, the affected tool call returns an MCP tool error (`isError: true`) rather than rejecting the whole connection — this keeps the failure visible in the LLM UI.

## Server configuration

Only deployment-level settings are configured via environment variables:

| Variable                     | Default                  | Description                           |
| ---------------------------- | ------------------------ | ------------------------------------- |
| `MCP_REPORTING_API_BASE_URL` | `http://localhost:31410` | Base URL of the reporting API         |
| `MCP_HOST`                   | `127.0.0.1`              | Host to bind the `/mcp` HTTP endpoint |
| `MCP_PORT`                   | `3900`                   | Port to bind the `/mcp` HTTP endpoint |

## Client (municipality) configuration

Each municipality configures their own connection with their own reporting token and project id, using [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as the stdio↔HTTP bridge. Example Claude Desktop config:

```json
{
  "mcpServers": {
    "openstad-reporting": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://reporting-mcp.example.org/mcp",
        "--header",
        "Authorization: Bearer ${REPORTING_TOKEN}",
        "--header",
        "X-Reporting-Project-Id: ${REPORTING_PROJECT_ID}"
      ],
      "env": {
        "REPORTING_TOKEN": "osr_your_own_reporting_token",
        "REPORTING_PROJECT_ID": "2"
      }
    }
  }
}
```

## Development

```bash
npm test --workspace=apps/mcp-server
```
