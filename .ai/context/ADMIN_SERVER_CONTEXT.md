# admin-server

`apps/admin-server` — Next.js admin console for configuring OpenStad projects and widgets.
It has **no database of its own**: all data goes through the api-server.

## Stack

- Next.js 16 with the **Pages Router** (not App Router), webpack bundler (`next dev --webpack`)
- React 19, TypeScript 5, Tailwind CSS 3, Radix UI components
- Session: **iron-session** encrypted cookie (`openstad-session`, key from `COOKIE_SECRET`) —
  see `src/auth.ts` / `src/auth-context.ts`
- `next.config.js`: `transpilePackages: ['@openstad-headless/*']`, webpack alias into the
  monorepo `packages/`, `/health` rewrite

## Directory map (`src/`)

| Folder                            | Purpose                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pages/projects/`                 | Main per-project admin UI: widgets, settings, resources, tags, areas, users, exports            |
| `pages/users/`, `pages/settings/` | Global user management and global settings                                                      |
| `pages/[...pluginPath].tsx`       | Plugin-based dynamic routing                                                                    |
| `pages/api/`                      | Next API routes: `current-user`, `health`, `widget-definitions`, `plugin-menu-items`, …         |
| `components/`                     | Reusable UI, dialogs, forms, uploaders, `widget-preview.tsx`                                    |
| `hooks/`                          | SWR-based API hooks (`use-widget-config`, `useWidgetPreview`, projects, users, resources, …)    |
| `lib/`                            | Role/access helpers (`hasRole`, `hasAccess`), widget definitions, export helpers                |
| `middleware.ts`                   | Auth guard: `getSession` + `HasAccess` over `restrictedPaths` (settings/users, exports, 2FA, …) |

## Auth

OAuth client of the auth-server (`CLIENT_ID`/`CLIENT_SECRET` = the admin client, `OAUTH_URL`).
Login rides the standard api-server flow (see the sequence diagram in
[AUTH_SERVER_CONTEXT.md](AUTH_SERVER_CONTEXT.md)); the resulting API JWT is stored in the
iron-session cookie and sent as `Bearer` on API calls. Calls to the api-server go through
`/api/openstad/...` proxy paths (`API_URL_INTERNAL`, `API_FIXED_AUTH_KEY`).

## Widget configuration & preview

- Widget config forms live under `pages/projects/[project]/widgets/<type>/`; saving goes through
  `hooks/use-widget-config.tsx` → `PUT /api/openstad/api/project/{projectId}/widgets/{id}` (the
  api-server merges the JSON `config`).
- Live preview: `components/widget-preview.tsx` POSTs the _unsaved_ form config to
  `/api/openstad/widget/preview` and injects the returned script. The preview executes the
  package's **prebuilt** `dist/` bundle — if a package was changed without `npm run build`, the
  preview shows stale code. Details and diagrams: [WIDGETS_CONTEXT.md](WIDGETS_CONTEXT.md).

## Conventions

- Data fetching belongs in `src/hooks/`, page logic in `src/pages/`, shared UI in
  `src/components/` — keep that separation.
- Type props explicitly; avoid `any`.
- UI changes must aim for WCAG 2.1 AA (see [CONVENTIONS.md](CONVENTIONS.md)).
- Unit tests: Vitest, co-located (`npm run test:unit:admin` from the root).
