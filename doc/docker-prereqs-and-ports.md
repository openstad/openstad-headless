## Docker prerequisites and local ports/domains

This is a short reference for the Docker happy path in [getting-started](./getting-started.md).

### Prerequisites

Minimum:

- **Docker + Docker Compose**
  - Use `docker compose` (recommended)
  - If you have an older setup where `docker compose` is not available, use `docker-compose`
- **Node.js + npm**
  - Required to run `npm run create-docker-config`

### Default local ports (BASE_PORT)

The Docker onboarding uses a base port plus fixed offsets (see `scripts/config.js`).

Defaults:

- `BASE_PORT=31400`
- API: `BASE_PORT + 10` → `31410`
- Auth: `BASE_PORT + 30` → `31430`
- Image: `BASE_PORT + 50` → `31450`
- Admin: `BASE_PORT + 70` → `31470`
- CMS: `BASE_PORT + 90` → `31490`

If you change `BASE_PORT`, these service ports move with it.

### How BASE_DOMAIN affects URLs

- If `BASE_DOMAIN=localhost` (simplest local setup), services use `localhost:{port}`.
- If `BASE_DOMAIN` is anything else, the stack expects subdomains:
  - `api.{BASE_DOMAIN}`, `auth.{BASE_DOMAIN}`, `image.{BASE_DOMAIN}`, `admin.{BASE_DOMAIN}`, `cms.{BASE_DOMAIN}`

For local development with a custom `BASE_DOMAIN`, you will typically need to add matching DNS/hosts entries for those subdomains.
