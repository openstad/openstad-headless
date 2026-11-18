# AGENTS.md

Guidance for AI coding agents working in this repository.

**Detailed context lives in [`.ai/context/`](.ai/context/REPO_CONTEXT.md)** — start with
[REPO_CONTEXT.md](.ai/context/REPO_CONTEXT.md) for the architecture overview, then read the
context file for the app or package you are changing. Human-oriented documentation lives in
[`doc/`](doc/).

## Project overview

OpenStad is an open-source citizen participation platform. This is a monorepo using npm
workspaces (`apps/*`, `packages/*`, `packages/apostrophe-widgets/*`) with:

- **5 server apps** in `apps/`: api-server (Express REST API), auth-server (OAuth2 SSO),
  admin-server (Next.js admin UI), cms-server (ApostropheCMS websites), image-server (uploads/resizing).
- **40+ widget packages** in `packages/`: React widgets built to IIFE bundles that any external
  website can embed via a single `<script>` tag served by the api-server.

Runtime: Node 24. Databases: MySQL (api + auth), MongoDB (cms), Redis (pub/sub + cache).

## Quick commands

```bash
# Development (full stack; `docker compose` automatically applies docker-compose.override.yml if present)
docker compose up

cd packages/<widget> && npm run dev      # Dev server for a single widget package

# Testing (run from repo root)
npm run test:unit                        # Vitest, all workspaces
npm run test:unit:<app>                  # Vitest per app: admin|api|auth|cms|image
npm run test:e2e                         # Cypress E2E (root /cypress, needs running stack)
npm run test:component                   # Cypress component tests (packages/**/cypress/component)

# Database
npm run init-databases                   # Init API + Auth databases
docker exec openstad-api-server bash -c "npm run migrate-database"

# Formatting (CI enforces this)
npm run format:check                     # Prettier check; `npm run format` to fix

# Before committing Helm chart changes
helm lint charts/openstad-headless -f charts/openstad-headless/values.yaml --strict
```

## Local URLs (default dev ports)

| Service                      | URL                                             |
| ---------------------------- | ----------------------------------------------- |
| API                          | http://localhost:31410                          |
| Auth                         | http://localhost:31430                          |
| Image (upload API / serving) | http://localhost:31450 / http://localhost:31451 |
| Admin                        | http://localhost:31470                          |
| CMS                          | http://localhost:31490                          |

Ports come from env vars (`API_PORT`, `AUTH_PORT`, …); these are the defaults from `.testing.env`.

## Widget development

Widgets have three parts: **package** (React frontend), **api-server** (config storage + serving),
**admin-server** (config UI). Flow: admin configures widget → config saved as JSON in the
`widgets` table → api-server serves package `dist/` bundle + config as a self-executing script →
embedded on any website via `<script src="{api-url}/widget/{widgetId}">`.

Key facts (full detail + diagrams in [WIDGETS_CONTEXT.md](.ai/context/WIDGETS_CONTEXT.md)):

- There is **no on-the-fly bundling**: the api-server reads prebuilt `dist/*.iife.js` files from
  disk. A package must be built (`npm run build`) before its latest code shows up anywhere,
  including the admin preview.
- `apps/api-server/nodemon-watch-server.js` auto-rebuilds packages (and their dependents) on file
  changes during development.
- Widgets are registered in `apps/api-server/src/routes/widget/widget-settings.js`; the serving
  logic is in `widget.js` and `widget-output.js` in the same directory.
- React is **not** bundled per widget — a shared runtime is loaded once per page as
  `window.OpenStadReact` from `{api-url}/widget/react-runtime.js`.

Debugging a widget: configure test data in the package's `src/main.tsx`, run `npm run dev` from
the package directory, and make sure the api-server is running.

## Testing requirements

- Unit tests **MUST** be created for new features and bug fixes, and updated when modifying
  existing functionality.
- Unit tests are written with **Vitest** and placed alongside the code they test, suffixed
  `.test.js` / `.test.ts` / `.test.tsx` (e.g. `src/utils/validation.test.ts`).
- Component tests (Cypress) are **strongly recommended** for new widgets or complex React
  components.
- See [TESTING.md](.ai/context/TESTING.md) for the full setup, including the legacy Jest configs
  in api-server/auth-server (do not use them — the root Vitest scripts are canonical).

## Conventions

See [CONVENTIONS.md](.ai/context/CONVENTIONS.md). Highlights:

- Follow existing patterns in the app you are editing; prefer small, incremental changes.
- UI changes must aim for WCAG 2.1 AA (semantic HTML, labels, keyboard navigation, contrast).
- api-server schema changes require an umzug migration in `apps/api-server/migrations/`.
- Widget CSS is scoped under the `.openstad` class prefix by the shared Vite config.

## Known gotchas

- **SWR/data-store**: the custom `@openstad-headless/data-store` package wraps SWR and can cause
  unexpected re-renders/caching issues. Its `package.json` `main` field is a typo (`index.jt`),
  so always import from `@openstad-headless/data-store/src`.
- **Widget preview**: the admin preview serves the package's `dist/` build — run `npm run build`
  in the package (or rely on the nodemon watcher) or the preview shows stale code.
- **Legacy code**: parts of the codebase were migrated from a non-React version; some code is
  verbose. Match local style, don't refactor unrelated code.
- **docker-compose.override.yml** is gitignored and developer-local; never reference it in
  committed code or CI.

## Rules

- **NEVER** use `--force` / `-f` with git commit or push in this repository.
- **NEVER** commit files that are in `.gitignore`.
- New or changed env vars must be applied in **three places**: `.env.example`,
  `docker-compose.yml`, **and** the Helm chart (`charts/openstad-headless`) — see the
  checklist in [CONVENTIONS.md](.ai/context/CONVENTIONS.md#adding-or-changing-environment-variables).
- Run `helm lint` (command above) before committing changes under `charts/`.
- Run `npm run format:check` before committing; CI fails on Prettier violations.
