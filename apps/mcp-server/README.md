# Openstad reporting MCP server

Exposes the Openstad reporting API (`/api/project/:projectId/reports/v1/...`) as a curated set of MCP tools, so an LLM client (e.g. Claude Desktop) can query resources, votes, comments, submissions, etc. without the model ever seeing a bearer token.

## Deployment model: one server per installation, multi-project within it

> **Not deployable from this repo yet.** There is no `docker-compose` service, no
> Helm chart template and no entry in the image-build matrix for this app — it
> ships as source. The section below describes how it is _meant_ to be deployed;
> the compose service, chart template and `MCP_*` wiring land with that work.

`MCP_REPORTING_API_BASE_URL` binds an MCP server to exactly **one** api-server, and Openstad is deployed as one installation per municipality. So deploy **one MCP server per Openstad installation** (alongside its api-server, in the same namespace) — a token issued on another installation only yields 401s here.

Within that installation the server is stateless and serves **every project**: it holds no reporting credentials of its own, and one process handles concurrent requests for different projects without shared state. Every request to `/mcp` carries its own credentials:

- `Authorization: Bearer <reporting-token>` — the same reporting API token used elsewhere against the Openstad API.
- `X-Reporting-Project-Id: <projectId>` — the id of the project that token was issued for.

Both are required because a reporting token is an opaque string; the server has no database access and cannot look up which project a token belongs to on its own. The reporting API (`apps/api-server`) validates that the token actually matches the given project.

If either header is missing or invalid, the affected tool call returns an MCP tool error (`isError: true`) rather than rejecting the whole connection — this keeps the failure visible in the LLM UI.

## Server configuration

Only deployment-level settings are configured via environment variables:

| Variable                     | Default                  | Description                                                                           |
| ---------------------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| `MCP_REPORTING_API_BASE_URL` | `http://localhost:31410` | Base URL of this installation's api-server                                            |
| `MCP_HOST`                   | `127.0.0.1`              | Host to bind the `/mcp` HTTP endpoint                                                 |
| `MCP_PORT`                   | `3900`                   | Port to bind the `/mcp` HTTP endpoint                                                 |
| `MCP_ALLOWED_HOSTS`          | _(unset)_                | Comma-separated `Host` headers to accept — **set this when binding beyond localhost** |

> **Deploying in a container:** `MCP_HOST` must be `0.0.0.0` for the port to be reachable from outside the pod. The MCP SDK applies DNS-rebinding protection automatically only for a localhost bind, so set `MCP_ALLOWED_HOSTS` to the hostname(s) the server is reached by — otherwise it accepts any `Host` header.

## Client configuration

Each client configures its own connection with its own reporting token and project id, pointed at the MCP server of the installation that issued the token, using [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) as the stdio↔HTTP bridge. Example Claude Desktop config:

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
