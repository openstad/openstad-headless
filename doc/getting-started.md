## Getting started (Docker)

This is the recommended happy path for local development: clone → generate config → start Docker → verify.

### Prerequisites

- Docker + Docker Compose
- Node.js + npm (to run `npm run create-docker-config`)

Details (including ports/domains): [Docker prerequisites and local ports/domains](./docker-prereqs-and-ports.md)

### 1) Clone and install dependencies

```sh
git clone https://github.com/openstad/openstad-headless
cd openstad-headless
npm i
```

### 2) Generate local Docker configuration (`.env`)

```sh
npm run create-docker-config
```

This command generates/updates your local `.env` and prints a login code plus the URLs you can use to verify the stack.

Configuration reference: [Configuration reference](./configuration.md)

### 3) Start the stack

```sh
docker compose up --build
```

If you have an older setup where `docker compose` is not available, use `docker-compose`.

### 4) Verify it works (core 5 URLs)

These URLs should load (defaults shown for `BASE_DOMAIN=localhost` / `BASE_PORT=31400`):

1. **API** — http://localhost:31410/api/project/1/resource
   - What you should see: JSON response (a list of resources)
2. **Auth login page** — http://localhost:31430/auth/code/login?clientId=uniquecode
   - What you should see: a login form page
3. **Image** — http://localhost:31450/image/forum.romanum.06.webp
   - What you should see: an image rendered in the browser
4. **Admin UI** — http://localhost:31470/
   - What you should see: the admin UI loads
5. **CMS UI** — http://localhost:31490/
   - What you should see: the CMS loads

Troubleshooting: [Troubleshooting](./troubleshooting.md)

### Reset / start over

- Stop the stack (keeps database volumes):

  ```sh
  docker compose down
  ```

- Full reset (removes volumes; **you will lose your local DB data**):

  ```sh
  docker compose down -v
  ```

### Widget development (admin previews)

Widget preview setup and widget build notes are intentionally kept out of this quickstart.

See: [Widget workflow](./widget-workflow.md)
