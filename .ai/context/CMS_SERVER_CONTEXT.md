# cms-server

`apps/cms-server` — ApostropheCMS 4 frontend serving the public, content-managed OpenStad
websites. One Node process hosts **multiple Apostrophe instances, one per project** (multi-site);
the project list is fetched from the api-server and refreshed every 5 minutes
(`REFRESH_PROJECTS_INTERVAL`).

## Stack

- ApostropheCMS 4 on Express, plain JavaScript (CommonJS)
- **MongoDB** as datastore (`MONGODB_URI`) — the only app not on MySQL
- Redis for message streaming with the api-server and Apostrophe caching
  (see [doc/message-streaming.md](../../doc/message-streaming.md))
- Nunjucks templates; assets built with `@apostrophecms/asset` (`npm run build`)
- Entry point: `app.js` (per-project bootstrap, rate limiting, compression, basic auth option);
  dev mode via nodemon (watches `app.js`, `modules/**`, `lib/**`, `views/**`)
- Package name is the legacy `openstad-frontend`

## Directory map

| Folder              | Purpose                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modules/`          | Apostrophe modules: `openstad-auth`, `openstad-login`, `openstad-assets`, and `openstad-*-widget` content widgets (accordion, alertBox, button, carousel, rte, section, timeline, …) |
| `lib/`              | Shared helpers, incl. `apos-config.js` (per-project Apostrophe config)                                                                                                               |
| `services/`         | `projects.js` (project list from API), `message-streaming.js` (Redis)                                                                                                                |
| `views/`, `public/` | Nunjucks templates and static assets                                                                                                                                                 |
| `config/`           | CMS + environment config                                                                                                                                                             |

Note: the CMS content widgets in `modules/` and `packages/apostrophe-widgets/` are a **separate
system** from the embeddable React widgets in `packages/` — OpenStad React widgets are embedded
in CMS pages via the same `<script>` mechanism as on any external site.

## Integration points

- api-server: `API_URL_INTERNAL` + `API_KEY` (= `API_FIXED_AUTH_KEY`) for project/resource data
- auth-server: login via the `openstad-auth` / `openstad-login` modules
- Redis message streaming: api-server notifies the CMS of project/config changes

## Notes

- No SQL migrations — Apostrophe manages its own MongoDB schema.
- Unit tests: Vitest (`apps/cms-server/vitest.config.ts` excludes `apos-build/` and vendored
  code); run `npm run test:unit:cms` from the root.
- `OVERWRITE_URL` can point a local CMS at a specific project domain during development.
