# Configuration reference

This page documents where configuration lives in OpenStad Headless and how it is derived.

- The primary configuration entry point for local development is the repo-root `.env` file.
- The effective `.env` values are **derived by scripts** (canonical: `scripts/config.js` and `scripts/create-docker-config.js`).
- Some configuration also lives in per-service `config/` folders.

Do not commit secrets. Use placeholders in docs and keep generated tokens private.

## Overview: configuration layers

| Layer               | What it is                                             | Where                                   | Notes                                                                  |
| ------------------- | ------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------- |
| `.env`              | Environment variables for local/dev and Docker Compose | repo root (`.env`)                      | Generated/updated by scripts; used by `docker-compose.yml` and servers |
| Generated artifacts | Files created by helper scripts                        | repo root (e.g. `nginx.config.example`) | Regenerate when domains/ports change                                   |
| Per-service config  | Service-specific configuration files                   | `apps/*/config/` (varies by service)    | Often defaults + overrides; still driven by env                        |

## Common overrides

These are the most common values you may change in local development:

- `BASE_DOMAIN`
  - Affects the public URLs/domains for API/Auth/Admin/CMS/Image.
  - If `BASE_DOMAIN=localhost`, URLs use `localhost:{port}`.
  - Otherwise the stack expects subdomains: `api.{BASE_DOMAIN}`, `auth.{BASE_DOMAIN}`, etc.

- `BASE_PORT`
  - Base port for the local stack (defaults to `31400`). Service ports are derived from it.

- `FORCE_HTTP`
  - When set, scripts derive `http://` URLs instead of `https://` for local dev.

(Ports/domains are also summarized in [Architecture & repo map](./architecture.md) and [Docker prerequisites and local ports/domains](./docker-prereqs-and-ports.md).)

## `.env` reference (happy path)

These keys are the ones most relevant to the onboarding happy path.

### Domains & ports

| Key             | Required | Purpose                              | Default / derivation                          | Secret |
| --------------- | -------- | ------------------------------------ | --------------------------------------------- | ------ |
| `BASE_DOMAIN`   | yes      | Base domain for derived service URLs | default: `localhost`                          | no     |
| `BASE_PORT`     | no       | Base port for derived service ports  | default: `31400`                              | no     |
| `FORCE_HTTP`    | no       | Use `http://` URLs in local/dev      | default: unset/empty                          | no     |
| `API_URL`       | usually  | Public API URL                       | derived from `BASE_DOMAIN` + `API_PORT`       | no     |
| `AUTH_APP_URL`  | usually  | Public Auth server URL               | derived from `BASE_DOMAIN` + `AUTH_PORT`      | no     |
| `ADMIN_URL`     | usually  | Public Admin server URL              | derived from `BASE_DOMAIN` + `ADMIN_PORT`     | no     |
| `CMS_URL`       | usually  | Public CMS server URL                | derived from `BASE_DOMAIN` + `CMS_PORT`       | no     |
| `IMAGE_APP_URL` | usually  | Public Image server URL              | derived from `BASE_DOMAIN` + `IMAGE_PORT_API` | no     |

### Database (MySQL)

| Key            | Required | Purpose                                    | Default / derivation                                   | Secret |
| -------------- | -------- | ------------------------------------------ | ------------------------------------------------------ | ------ |
| `DB_HOST`      | yes      | MySQL hostname                             | depends on setup (`openstad-mysql` in Docker)          | no     |
| `DB_USERNAME`  | yes      | MySQL username                             | default: `openstad`                                    | no     |
| `DB_PASSWORD`  | yes      | MySQL password                             | generated if missing                                   | yes    |
| `DB_BASE_NAME` | optional | Base name used to derive API/Auth DB names | optional                                               | no     |
| `API_DB_NAME`  | optional | API database name                          | derived from `DB_BASE_NAME` or default `openstad-api`  | no     |
| `AUTH_DB_NAME` | optional | Auth database name                         | derived from `DB_BASE_NAME` or default `openstad-auth` | no     |

### Auth (login + service-to-service)

| Key                     | Required | Purpose                                         | Default / derivation        | Secret |
| ----------------------- | -------- | ----------------------------------------------- | --------------------------- | ------ |
| `AUTH_FIRST_LOGIN_CODE` | yes      | Quick login code for development/onboarding     | you choose (used to log in) | yes    |
| `API_FIXED_AUTH_KEY`    | usually  | Fixed auth key used for service-to-service auth | generated if missing        | yes    |

### Email (SMTP)

| Key                  | Required       | Purpose              | Default / derivation | Secret |
| -------------------- | -------------- | -------------------- | -------------------- | ------ |
| `FROM_EMAIL_ADDRESS` | optional (dev) | Default sender email | placeholder          | no     |
| `SMTP_HOST`          | optional (dev) | SMTP server hostname | placeholder          | no     |
| `SMTP_PORT`          | optional (dev) | SMTP server port     | placeholder          | no     |
| `SMTP_USERNAME`      | optional (dev) | SMTP username        | placeholder          | yes    |
| `SMTP_PASSWORD`      | optional (dev) | SMTP password        | placeholder          | yes    |

## `.env` reference (optional / advanced)

Use these when you need a more specific setup.

### Database security

- `DB_REQUIRE_SSL` — require SSL for DB connections (boolean)
- `DB_AUTH_METHOD` — select DB auth method (e.g. `azure-auth-token`)

### Redis / message streaming

- `MESSAGESTREAMING_REDIS_URL` — Redis URL/hostname for pub/sub

### CMS

- `CMS_MONGODB_URI` — MongoDB URI for Apostrophe content storage
- `CMS_OVERWRITE_URL` — URL overwrite for local dev setups

### Image storage (optional)

Some deployments use S3-compatible storage for images/documents (when configured in the image server).

### Telemetry (optional)

OpenTelemetry is supported across services; see env vars like `OTEL_*` in deployment environments.

## Generated artifacts

| Artifact               | Generated by                                                       | Path      | When / why to regenerate                                                         |
| ---------------------- | ------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------- |
| `.env`                 | `npm run create-docker-config` (`scripts/create-docker-config.js`) | repo root | When you change domains/ports or want fresh generated secrets for local dev      |
| `nginx.config.example` | `scripts/create-nginx-config-example.js`                           | repo root | When you change `BASE_DOMAIN` / ports and use the non-Docker reverse proxy setup |

Database initialization and migrations are documented separately: see [Databases](./databases.md).

## Per-service config locations

This section helps you find where each service’s config lives beyond `.env`.

| Service      | Primary config locations   | Notes                                                                     |
| ------------ | -------------------------- | ------------------------------------------------------------------------- |
| api-server   | `apps/api-server/config/`  | Uses the `config` (node-config) pattern; still heavily driven by env vars |
| auth-server  | `apps/auth-server/config/` | Auth flow defaults and validation settings live here                      |
| cms-server   | `apps/cms-server/config/`  | Apostrophe/CMS runtime config, widgets, locales                           |
| admin-server | `apps/admin-server/`       | Next.js config and runtime env vars; proxies to API/Auth in local dev     |
| image-server | `apps/image-server/`       | Env-driven server config + optional S3/local storage settings             |
