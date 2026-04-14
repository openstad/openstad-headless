# Troubleshooting

If the stack doesn’t come up cleanly during onboarding, use this page to diagnose the most common failure modes quickly.

Start with **Quick triage**. If you already have a specific error message, jump to **Common onboarding failures**.

## Quick triage

### 1) Confirm config and URLs

- If you’re using the Docker happy path, regenerate config and note the printed URLs/login code:

  ```sh
  npm run create-docker-config
  ```

  See: [Configuration reference](./configuration.md)

- Default ports (derived from `BASE_PORT=31400`) are documented in: [Docker prerequisites and local ports/domains](./docker-prereqs-and-ports.md)

### 2) Confirm containers are running

```sh
docker compose ps
```

If a container is restarting, go straight to logs.

### 3) Check logs (start with API)

```sh
docker compose logs -f openstad-api-server
```

Other useful logs:

```sh
docker compose logs -f openstad-auth-server
docker compose logs -f openstad-admin-server
docker compose logs -f openstad-image-server
docker compose logs -f openstad-cms-server
```

### 4) Hit health endpoints

All app services expose `/health`. The API server also exposes `/db-health`.

Defaults for `BASE_DOMAIN=localhost` / `BASE_PORT=31400`:

- API
  - http://localhost:31410/health
  - http://localhost:31410/db-health
- Auth: http://localhost:31430/health
- Image: http://localhost:31450/health
- Admin: http://localhost:31470/health (rewritten to `/api/health`)
- CMS: http://localhost:31490/health

If `/db-health` fails, focus on MySQL connectivity/credentials (see below).

### 5) Verify the core URLs

The onboarding “known-good” URLs are listed in: [Getting started (Docker)](./getting-started.md)

## Common onboarding failures

Each entry is **symptom → likely cause → fix → verify**.

### Database init / migrations / missing tables

**Symptoms**

- API returns 500 for normal endpoints.
- API `/db-health` returns a DB connection error.
- Logs contain Sequelize/MySQL errors like “table doesn’t exist”.

**Likely causes**

- The DB containers are up, but tables/seeds weren’t initialized yet.
- Models changed and your local DB is behind (needs migrations).

**Fix**

- Check MySQL is healthy:

  ```sh
  docker compose logs -f openstad-mysql
  ```

- Initialize databases (Docker setup):

  ```sh
  docker compose exec -w /opt/openstad-headless/apps/api-server openstad-api-server npm run init-database
  docker compose exec -w /opt/openstad-headless/apps/auth-server openstad-auth-server npm run init-database
  ```

- If you suspect a schema mismatch after pulling updates, run migrations:

  ```sh
  docker compose exec -w /opt/openstad-headless/apps/api-server openstad-api-server npm run migrate-database
  docker compose exec -w /opt/openstad-headless/apps/auth-server openstad-auth-server npm run migrate-database
  ```

For background and non-Docker setups, see: [Databases](./databases.md)

**Verify**

- http://localhost:31410/db-health returns `200` with `status: UP`.
- The API example endpoint from getting-started returns JSON.

### “Redirect host not allowed” during login

**Symptoms**

- After a login redirect, you see: **Redirect host not allowed**.

**Likely causes**

- Your project’s `allowedDomains` does not include the host you’re redirecting back to.
- `BASE_DOMAIN` / derived URLs changed but project config wasn’t updated.

**Fix**
Update the project config in the API (example from [Setup](./setup.md)):

```http
PUT https://api.BASE_DOMAIN/api/project/1
Content-type: application/json
Authorization: AUTH_FIRST_LOGIN_CODE

{
  "config": {
    "allowedDomains": [
      "YOUR-CMS.BASE_DOMAIN"
    ]
  }
}
```

Use the domain you actually use in the browser (for Docker defaults that’s often `localhost:31490` for CMS, or the relevant subdomain when `BASE_DOMAIN` isn’t `localhost`).

**Verify**

- Repeat the login flow from getting-started and confirm the redirect completes.

### bcrypt build issues during `npm i`

**Symptoms**

- `npm i` fails while compiling **bcrypt** (native module build errors / node-gyp errors).

**Likely causes**

- Missing OS build tooling required to compile native dependencies.

**Fix**

- macOS: install Xcode Command Line Tools:

  ```sh
  xcode-select --install
  ```

- Debian/Ubuntu: install build tools:

  ```sh
  sudo apt-get update && sudo apt-get install -y build-essential python3
  ```

Then rerun `npm i`.

**Verify**

- `npm i` completes successfully.

### Docker reset / volumes (when to use `down` vs `down -v`)

**Symptoms**

- You want to “start over” because the DB state seems inconsistent.
- You changed config and things are stuck in an unexpected state.

**Fix**

- Soft reset (keeps volumes / keeps DB data):

  ```sh
  docker compose down
  docker compose up --build
  ```

- Hard reset (removes volumes; **you will lose local DB data**):

  ```sh
  docker compose down -v
  docker compose up --build
  ```

See also: [Getting started (Docker)](./getting-started.md)

**Verify**

- Containers are healthy and the 5 core URLs load.

### Port already in use

**Symptoms**

- A container fails to start with “port is already allocated” (or similar).

**Fix**

- Change `BASE_PORT` (or the conflicting derived port) and regenerate `.env`:

  ```sh
  npm run create-docker-config
  ```

**Verify**

- `docker compose up` starts without port binding errors.

### Custom BASE_DOMAIN doesn’t resolve (subdomains)

**Symptoms**

- API/Auth/Admin/CMS URLs don’t resolve when `BASE_DOMAIN` isn’t `localhost`.

**Likely cause**

- Missing DNS/hosts entries for `api.{BASE_DOMAIN}`, `auth.{BASE_DOMAIN}`, etc.

**Fix**

- Add appropriate entries to your `/etc/hosts` (see [Setup](./setup.md)) or use `BASE_DOMAIN=localhost`.

**Verify**

- The core URLs load in the browser.

### CMS MongoDB not running (optional)

**Symptoms**

- `openstad-cms-server` starts but errors about MongoDB connectivity.

**Fix**

- Check Mongo logs:

  ```sh
  docker compose logs -f openstad-mongo
  ```

Note: some deployments do not use `openstad-cms-server`. If you’re not using CMS in your setup, you can ignore Mongo/CMS.

**Verify**

- http://localhost:31490/health returns `200`.

## Where to look when it breaks

### Fast map: service → logs → health

| Service | Docker Compose name     | Logs                                           | Health endpoint                       |
| ------- | ----------------------- | ---------------------------------------------- | ------------------------------------- |
| API     | `openstad-api-server`   | `docker compose logs -f openstad-api-server`   | `/health`, `/db-health`               |
| Auth    | `openstad-auth-server`  | `docker compose logs -f openstad-auth-server`  | `/health`                             |
| Admin   | `openstad-admin-server` | `docker compose logs -f openstad-admin-server` | `/health` (rewrites to `/api/health`) |
| Image   | `openstad-image-server` | `docker compose logs -f openstad-image-server` | `/health`                             |
| CMS     | `openstad-cms-server`   | `docker compose logs -f openstad-cms-server`   | `/health`                             |
| MySQL   | `openstad-mysql`        | `docker compose logs -f openstad-mysql`        | (container healthcheck)               |
| Redis   | `openstad-redis`        | `docker compose logs -f openstad-redis`        | (container healthcheck)               |
| Mongo   | `openstad-mongo`        | `docker compose logs -f openstad-mongo`        | (no HTTP health endpoint)             |

### Debug knob: API request logging

The API server supports request logging via `REQUEST_LOGGING=ON`.

- If you run the API server outside Docker, you can set `REQUEST_LOGGING=ON` before starting it.
- If you run via Docker Compose, you’ll need to ensure `REQUEST_LOGGING` is passed into the `openstad-api-server` container (e.g. by adding it to the `environment:` list in `docker-compose.yml`).
