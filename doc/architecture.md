# Architecture & repo map

This page is a quick mental model of the OpenStad Headless monorepo: what lives where, which services exist, how they interact, and which ports/domains are used in local Docker development.

If you just want to run the stack locally, start with [Getting started (Docker)](./getting-started.md).

## Repo map

At a high level, this repo contains **deployable services** under `apps/` and **shared packages/widgets** under `packages/`.

### Top-level folders

- `apps/` — deployable services (the stack): API, Auth, Admin UI, CMS, Image
- `packages/` — shared npm packages (libs + UI + widget packages)
- `charts/` — Helm chart for Kubernetes deployment
- `operations/` — deployment scripts and environment-specific configs
- `scripts/` — local setup helpers (e.g. generating `.env`, initializing databases)
- `doc/` — repo-level documentation (this folder)
- `cypress/` — end-to-end tests
- `vendor/` — vendored dependencies

## Services overview

The local Docker stack runs 5 services (plus infra like MySQL/Redis/Mongo/Mailpit/Jaeger).

| Service                                    | Lives in             | Responsibility                                                                      | Depends on                                          |
| ------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| **API server** (`openstad-api-server`)     | `apps/api-server/`   | Central REST API and data authority; also renders widgets and handles notifications | MySQL, Redis, Auth server, Image server             |
| **Auth server** (`openstad-auth-server`)   | `apps/auth-server/`  | OAuth2 authentication server (login flows, tokens, clients)                         | MySQL                                               |
| **Admin server** (`openstad-admin-server`) | `apps/admin-server/` | Next.js admin UI to manage projects/resources/widgets/settings                      | API server, Auth server                             |
| **CMS server** (`openstad-cms-server`)     | `apps/cms-server/`   | ApostropheCMS server for public sites (multi-tenant per project domain)             | Redis (and MongoDB for content) + API server        |
| **Image server** (`openstad-image-server`) | `apps/image-server/` | Upload + storage + resizing of images/documents                                     | Local filesystem (default) or S3-compatible storage |

### Shared “widget packages”

A large part of this repo lives under `packages/`: reusable React widget packages (comments, voting, maps, resource overviews, etc.). Widgets are used in multiple places:

- In **CMS pages** (widgets embedded into public pages)
- In **Admin UI** (widget configuration pages + previews)
- Via **API server widget rendering** endpoints

## Ports & domains (local Docker)

### Default ports (derived from `BASE_PORT`)

Ports are derived from a base port (defaults to `BASE_PORT=31400`) using fixed offsets:

- API: `BASE_PORT + 10` → `31410`
- Auth: `BASE_PORT + 30` → `31430`
- Image: `BASE_PORT + 50` → `31450`
- Admin: `BASE_PORT + 70` → `31470`
- CMS: `BASE_PORT + 90` → `31490`

If you change `BASE_PORT`, these service ports move with it.

### How `BASE_DOMAIN` affects URLs

- If `BASE_DOMAIN=localhost` (simplest local setup), services use `localhost:{port}`.
- If `BASE_DOMAIN` is anything else, the stack expects subdomains:
  - `api.{BASE_DOMAIN}`, `auth.{BASE_DOMAIN}`, `image.{BASE_DOMAIN}`, `admin.{BASE_DOMAIN}`, `cms.{BASE_DOMAIN}`

For local development with a custom `BASE_DOMAIN`, you will typically need matching DNS/hosts entries for those subdomains.

### Quick table (defaults)

| Service | Default port | Example URL (`BASE_DOMAIN=localhost`) |
| ------- | ------------ | ------------------------------------- |
| API     | 31410        | http://localhost:31410                |
| Auth    | 31430        | http://localhost:31430                |
| Image   | 31450        | http://localhost:31450                |
| Admin   | 31470        | http://localhost:31470                |
| CMS     | 31490        | http://localhost:31490                |

For more detail (and the offset model), see [Docker prerequisites and local ports/domains](./docker-prereqs-and-ports.md).

## Internal Docker hostnames (service-to-service)

Inside the Docker network, services talk to each other using the **compose service names** as hostnames. These show up explicitly in `docker-compose.yml` as “internal URL” env vars.

Common internal hostnames:

- API server: `http://openstad-api-server:${API_PORT}`
- Auth server: `http://openstad-auth-server:${AUTH_PORT}`
- Image server: `http://openstad-image-server:${IMAGE_PORT_API}`

Examples (from `docker-compose.yml`):

- Admin → API: `API_URL_INTERNAL=http://openstad-api-server:${API_PORT}`
- Admin → Auth: `OAUTH_URL_INTERNAL=http://openstad-auth-server:${AUTH_PORT}`
- CMS → API: `API_URL_INTERNAL=http://openstad-api-server:${API_PORT}`
- API → Auth: `AUTH_ADAPTER_OPENSTAD_SERVERURL_INTERNAL=http://openstad-auth-server:${AUTH_PORT}`
- API → Image: `IMAGE_APP_URL_INTERNAL=http://openstad-image-server:${IMAGE_PORT_API}`

This distinction (external URL vs internal URL) is useful when debugging: it tells you whether a request is expected to go **through your browser** (external) or **between containers** (internal).

## High-level request/data flow

### Admin config flow (admin → api/auth)

1. You open the Admin UI in your browser (admin-server).
2. The Admin UI calls the API server to load/save project/widget configuration.
3. When authentication is required, Admin redirects into the Auth server OAuth2 flow.

### CMS + widgets flow (cms/widgets → api/auth)

1. A visitor requests a CMS page (cms-server).
2. The CMS server renders the page and embeds widget bundles.
3. Widget JavaScript runs in the browser and calls the API server for data.
4. If the visitor needs to log in, the flow redirects via API/Auth and the browser later uses the issued token for API calls.

### Where data lives

- API/Auth data: MySQL (via Sequelize)
- CMS content: MongoDB (Apostrophe)
  - Note: **cms-server** is the running ApostropheCMS application; **CMS content** is the data it stores in MongoDB.
  - Some deployments do not use `openstad-cms-server` anymore; in that case, MongoDB/CMS content may be irrelevant for that setup.
- Cross-service events/cache: Redis (pub/sub)
- Images/documents: local filesystem (default) or S3-compatible storage (optional)
