# Conventions

General rules for working in this repo. Match the style of the code you are editing; parts of
the codebase are legacy (migrated from a non-React version) and verbose — don't refactor
unrelated code while making a change.

## General

- Small, incremental changes over big rewrites; follow existing patterns in the app you touch.
- Formatting is Prettier, CI-enforced: `npm run format:check` (fix with `npm run format`).
- One root `package-lock.json`; never commit per-app lockfiles.
- Never use `--force`/`-f` with git commit or push.
- `.planning/` is local scratch space — never commit it.

## Next.js / React / TypeScript (admin-server, widget packages)

- admin-server: page logic in `src/pages`, UI components in `src/components`, data fetching in
  `src/hooks` — keep the separation.
- Prefer existing types (`@openstad-headless/types`) and utilities; avoid duplicating types.
- Keep props typed; avoid `any`.
- Prefer small, composable components; match existing component and hook patterns.
- Widget packages import the data layer from `@openstad-headless/data-store/src` (see
  [WIDGETS_CONTEXT.md](WIDGETS_CONTEXT.md) for why).

## Express / Sequelize (api-server, auth-server)

- New endpoints in `apps/api-server/src/routes`; new models in `src/models`.
- **Every schema change requires an umzug migration** in `apps/api-server/migrations/`
  (numbered, `(queryInterface, Sequelize)` signature). Same pattern in auth-server.
- Use MySQL-compatible SQL in migrations (no PostgreSQL-isms).
- Reuse existing middleware for auth, pagination, sorting, and security headers.
- Keep route handlers small; push repeated logic into `services/`/`util/`.
- Validate inputs and handle errors consistently with surrounding code.
- Respect the sequelize-authorization mixins (model-level `auth` blocks) when adding models or
  endpoints.

## CSS

- Widget styles are co-located in the package and scoped under the `.openstad` prefix by the
  shared Vite config — don't add global styles from a widget.
- Match existing naming conventions; avoid large global overrides.

## Accessibility (WCAG 2.1 AA)

UI changes must aim for WCAG 2.1 AA:

- Semantic HTML, correct heading structure, proper `label`s on form fields.
- Visible focus states and full keyboard navigation.
- Sufficient color contrast.
- There is no automated a11y test harness (see [TESTING.md](TESTING.md)) — verify manually, and
  consider adding axe checks for significant UI work.

## Documentation

- Human-oriented docs live in [`doc/`](../../doc/) (setup, deployment, databases, audit logging,
  message streaming, maps, admin model). Reference them instead of duplicating their content.
- Keep the `.ai/context/` files up to date when you change architecture-level behavior
  (new app, new widget registration mechanism, auth flow changes, test tooling).

## Helm / Kubernetes

- Chart lives in `charts/openstad-headless`; per-service templates under
  `templates/{admin,api,auth,cms,image}/` (each with `deployment.yaml`, `service.yaml`,
  `ingress.yaml`) plus shared `templates/secrets/` and `values.yaml`.
- Mind YAML whitespace trimming (`{{-` vs `{{`) in templates; always validate with:

  ```bash
  helm lint charts/openstad-headless -f charts/openstad-headless/values.yaml --strict
  ```

  before committing chart changes (CI release flow runs the same lint).

### Adding or changing environment variables

An env var that only lands in `.env.example` and `docker-compose.yml` **does not exist in
production** — Kubernetes deployments get their env exclusively from the Helm chart. Every PR
that introduces or renames an env var must update all three places:

1. **`.env.example`** — document the variable with a sensible example value.
2. **`docker-compose.yml`** — add it to the `environment:` block of the affected service(s).
3. **Helm chart** (`charts/openstad-headless`):
   - Add the variable to the `env:` list in
     `templates/<service>/deployment.yaml` of every affected service.
   - **api and auth have the env block twice** in their `deployment.yaml`: once for the main
     container and once for the init container that runs `init-database`/`migrate-database`.
     If the variable is needed during init/migration (DB, auth, plugin settings), add it to
     both blocks.
   - **Non-secret, configurable values**: back the env var with a key under the service's
     section in `values.yaml` (`.Values.<service>...`) so operators can override it per
     install; provide a working default.
   - **Secrets** (tokens, passwords, keys): never a plain `value:`. Add a key to the matching
     `templates/secrets/*-secret.yaml` (with a `default (randAlphaNum …)` where appropriate),
     expose it under `secrets:` in `values.yaml`, and reference it from the deployment via
     `valueFrom.secretKeyRef` using the `openstad.*.secret.fullname` helpers in
     `_helpers.tpl`.
4. If the variable is consumed by the setup scripts, also document it in
   [doc/setup-options.md](../../doc/setup-options.md).

Verify with `helm lint` (above) and check the rendered output contains your variable:

```bash
helm template charts/openstad-headless -f charts/openstad-headless/values.yaml | grep -A2 MY_NEW_VAR
```
