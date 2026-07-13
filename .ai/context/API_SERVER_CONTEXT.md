# api-server

`apps/api-server` — core REST API (Express 4, CommonJS) for all OpenStad data: projects,
resources, users, widgets, voting, comments, and notifications. Also serves the embeddable
widget bundles (see [WIDGETS_CONTEXT.md](WIDGETS_CONTEXT.md)).

## Stack

- Express 4, plain JavaScript (CommonJS)
- Sequelize 6 on MySQL/MariaDB; migrations via **umzug** in `migrations/` (numbered files),
  tracked in the `migrations` table
- Config via the `config` npm package: defaults in `config/default.js`, overridden by env vars
- Redis for message streaming to cms-server
- Entry point: `server.js` → `src/Server.js` (`Server.init()` + `Server.start()`), also starts
  `src/cron-calendar.js` and validates external certificates

## Directory map (`src/`)

| Folder                                                    | Purpose                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `routes/api/`                                             | Main REST endpoints: project, user, resource, comment, vote, tag, status, widget CRUD, upload, …              |
| `routes/auth/`                                            | Login/me endpoints; dispatches to the auth adapter                                                            |
| `routes/widget/`                                          | Widget serving: `widget.js` (routes), `widget-settings.js` (registry), `widget-output.js` (IIFE assembly)     |
| `routes/notification/`, `routes/stats/`, `routes/plugin/` | Notification templates, stats, plugin endpoints                                                               |
| `models/`                                                 | ~30 Sequelize models: `Project`, `Resource`, `User`, `Vote`, `Comment`, `Widget`, `Submission`, `AuditLog`, … |
| `adapter/`                                                | Auth adapters: `openstad/` (default) and `oidc/`, each with `index.js`, `router.js`, `service.js`             |
| `middleware/`                                             | `user.js` (JWT → `req.user`), sequelize-authorization, pagination, sorting, security headers                  |
| `lib/sequelize-authorization/`                            | Model-level access control (`can.js`, `roles.js`, `hasRole.js`)                                               |
| `services/`, `notifications/`, `cron/`, `util/`           | Supporting services, notification engines (email/SMS), scheduled jobs, helpers                                |

Top-level: `migrations/`, `seeds/` (`default.js`, `development.js`, `test.js`), `config/`,
`nodemon-watch-server.js` (dev auto-rebuild of widget packages), `scripts/` (incl.
`init-database.js`, `migrate-database.js`, `build-react-runtime.js`).

## Core domains

- **projects** — config, domains, allowed domains, project lifecycle
- **users** — per-project users linked to an identity provider (`idpUser`), roles, anonymization
- **resources** — submissions/ideas + statuses/tags + attachments
- **comments + votes** — threads, voting, stats
- **widgets** — widget instances (`widgets` table: `type`, `description`, `config` JSON)
- **choice guide / enquete** — questionnaires, results, scoring
- **maps / areas / datalayers** — geo data, polygons, map layers
- **notifications** — templates (Nunjucks email), scheduling, delivery engines

## Auth (how `req.user` is resolved)

- `src/middleware/user.js` parses `Authorization: Bearer <jwt>`, verifies with
  `config.auth.jwtSecret` (`AUTH_JWTSECRET`), loads the user. Also supports fixed tokens
  (`fixedAuthTokens`, used by admin-server/cms-server via `API_FIXED_AUTH_KEY`).
- Per-project auth config is resolved by `src/util/auth-settings.js`, which selects an adapter
  (`openstad` default, `oidc` alternative). The `openstad` adapter talks to the auth-server over
  its internal URL for the OAuth code exchange and `/api/userinfo`.
- Full login sequence diagram: [AUTH_SERVER_CONTEXT.md](AUTH_SERVER_CONTEXT.md).
- Row-level authorization is enforced by the sequelize-authorization mixins on models
  (e.g. `Widget`: create requires `editor`, update `editor`/`owner`).

## Database workflow

```bash
npm run init-database      # from apps/api-server: reset DB, apply migrations, seed
npm run migrate-database   # apply pending umzug migrations (supports down + step=N)
```

Schema changes **require** a new numbered migration in `apps/api-server/migrations/`; migrations
receive `(queryInterface, Sequelize)`. Plugin packages can contribute extra migrations via
`@openstad-headless/plugin-loader`. See [doc/databases.md](../../doc/databases.md).

## Notable implementation details

- Audit logging of CRUD/auth events to the `audit_logs` table (see
  [doc/audit-logging.md](../../doc/audit-logging.md)); auth-server posts its events to
  `/api/audit-log/auth-event`.
- Cron jobs in `src/cron/` (anonymization, score recalculation, cleanup) driven by
  `src/cron-calendar.js`.
- A legacy `jest.config.js` exists but unit tests run through the root Vitest setup
  (`npm run test:unit:api`) — write new tests with Vitest.
