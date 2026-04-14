## Widget workflow (preview in admin)

This page explains how widget preview works in the admin UI in local development, what needs to be built for preview to work, and what you need to change when adding a new widget.

The goal is: **copy/paste the commands, follow the steps, and get a working preview with minimal trial-and-error**.

### Prerequisites

- You have installed dependencies at repo root: `npm i`
- You have the stack running (admin + api reachable). See: `doc/getting-started.md`
- You can log into the admin UI

### Build widgets for admin preview (recommended)

In development, the admin preview does **not** use Vite dev servers. The API server reads built widget assets from `packages/<widget>/dist/`.

Recommended command (build everything that preview can render):

```sh
npm -w @openstad-headless/api-server run build-packages
```

What this command does:

- Uses `apps/api-server/scripts/build-packages.js`
- Looks at `apps/api-server/src/routes/widget/widget-settings.js` to determine which widget packages exist
- Builds dependency packages first (e.g. `ui`, `lib`), then builds all widgets
- Outputs build artifacts to `packages/*/dist/` (examples):
  - `packages/counter/dist/counter.iife.js`
  - `packages/counter/dist/counter.css`
- Uses `.packages-build-hash` to skip rebuilding if it detects no changes

If you get `No changes detected, skipping build` but you’re missing `dist/` outputs, delete `.packages-build-hash` and re-run the command.

### Build a single widget (alternative)

If you only want to build one widget package:

```sh
npm -w @openstad-headless/<widget> run build
```

Expected outputs live under `packages/<widget>/dist/` and usually include:

- `dist/*.iife.js`
- `dist/*.css`

### How admin preview works (under the hood)

This is the request flow in local dev:

1. **Admin widget page triggers preview**

- Widget settings pages (example):
  - `apps/admin-server/src/pages/projects/[project]/widgets/counter/[id]/index.tsx`
- The preview component is:
  - `apps/admin-server/src/components/widget-preview.tsx`

That component POSTs to:

- `POST /api/openstad/widget/preview?projectId=<projectId>`

With JSON body that includes:

- `widgetType` (string key like `counter`, typed from `apps/admin-server/src/lib/widget-definitions.tsx`)
- widget config fields (spread into the body)

2. **Admin server rewrites `/api/openstad/*` to the API server + adds auth**

- `apps/admin-server/src/auth.ts` rewrites `/api/openstad/...` to `${API_URL_INTERNAL || API_URL}/...`
- It injects `Authorization: Bearer <jwt>` so the browser can call `/api/openstad/...` without handling API auth directly

3. **API server returns JavaScript that injects the widget**

- The preview endpoint is implemented in:
  - `apps/api-server/src/routes/widget/widget.js` (`POST /widget/preview`)

The API server:

- Validates `widgetType`
- Looks up bundling settings from:
  - `apps/api-server/src/routes/widget/widget-settings.js`
- Reads the built widget assets from the widget package using `require.resolve(...)`
  - This is why the widget package must be a dependency in `apps/api-server/package.json`
- Responds with `Content-Type: application/javascript`
- The response script creates a container `<div class="openstad" id="...">`, loads CSS, evaluates the widget’s IIFE output, and calls:

  `${functionName}.${componentName}.loadWidget(<id>, <config>)`

### Verify it works

1. Build widgets:

```sh
npm -w @openstad-headless/api-server run build-packages
```

2. Start the stack (if needed):

```sh
docker compose up --build
```

3. Open the admin UI, log in, and navigate to any widget settings page (example pattern):

- `/projects/<projectId>/widgets/counter/<widgetId>`

4. Confirm the preview renders.

If it doesn’t:

- Check the browser Network tab for `/api/openstad/widget/preview?projectId=...`
  - Expected: HTTP 200 + JavaScript response
- Check the API server logs for messages about missing `dist` files / invalid widget type.

### Add a new widget end-to-end

This is the minimum wiring needed to make a new widget type build + preview in admin.

#### 1) Create the widget package

Create a new package directory: `packages/<widget>/`.

At minimum you need:

- `packages/<widget>/package.json`
  - `name`: `@openstad-headless/<widget>`
  - scripts include `build` (typically `tsc && vite build`)
- `packages/<widget>/vite.config.ts`
  - IIFE build output
  - `build.lib.name` must match the API server `functionName`
  - example pattern: `packages/counter/vite.config.ts`
- `packages/<widget>/src/<entry>.tsx`
  - export your component
  - attach `Component.loadWidget = loadWidget` so the API server can call it
  - example pattern: `packages/counter/src/counter.tsx`

#### 2) Add widget bundling config in the API server

Add a new entry in:

- `apps/api-server/src/routes/widget/widget-settings.js`

Every widget definition must include these keys:

- `packageName`
- `directory`
- `js`
- `css`
- `functionName`
- `componentName`
- `defaultConfig`

Example (simplified, based on `counter`):

```js
<widgetType>: {
  packageName: '@openstad-headless/<widget>',
  directory: '<widget>',
  js: ['dist/<widget>.iife.js'],
  css: ['dist/<widget>.css'],
  functionName: 'OpenstadHeadless<Widget>',
  componentName: '<ComponentName>',
  defaultConfig: {
    projectId: null,
  },
}
```

Make sure `js/css` point to files that actually exist under `packages/<widget>/dist/` after building.

#### 3) Add the widget package dependency to the API server

The API server reads widget build outputs using `require.resolve(...)`, so it must depend on the widget package.

Edit:

- `apps/api-server/package.json`

Add:

- `"@openstad-headless/<widget>": "*"`

Then run at repo root:

```sh
npm i
```

#### 4) Wire it into the admin UI

Add the widget type to the admin definitions list:

- `apps/admin-server/src/lib/widget-definitions.tsx`

Then add a widget settings page route:

- `apps/admin-server/src/pages/projects/[project]/widgets/<widgetType>/[id]/index.tsx`

Recommended approach:

- Copy an existing widget page, e.g.
  - `apps/admin-server/src/pages/projects/[project]/widgets/counter/[id]/index.tsx`
- Update imports/types/config form to match your widget
- Keep `WidgetPreview` wired to your widget type:
  - `<WidgetPreview type="<widgetType>" ... />`

#### 5) Build + verify

- Build (recommended): `npm -w @openstad-headless/api-server run build-packages`
- Create the widget in admin (`/projects/<projectId>/widgets/create`)
- Open the widget page and confirm the preview renders

#### Key invariants (when preview fails)

- The widget type key must match across:
  - `apps/admin-server/src/lib/widget-definitions.tsx` (the key)
  - `apps/admin-server/src/pages/projects/[project]/widgets/<widgetType>/...` (folder name)
  - `apps/api-server/src/routes/widget/widget-settings.js` (definition key)
  - `apps/admin-server/src/components/widget-preview.tsx` request body (`widgetType`)

- `functionName` must match the Vite IIFE global:
  - `packages/<widget>/vite.config.ts` → `build.lib.name`
  - `apps/api-server/src/routes/widget/widget-settings.js` → `functionName`

- `componentName` must match the component export name in the IIFE output:
  - `apps/api-server/src/routes/widget/widget-settings.js` → `componentName`

- The component must expose `.loadWidget`:
  - `Component.loadWidget = loadWidget` (see `packages/counter/src/counter.tsx`)

### Troubleshooting (common preview failures)

- **400 “Invalid widget type…”** (API response)
  - The `widgetType` key doesn’t exist in `apps/api-server/src/routes/widget/widget-settings.js`
  - Or the admin is sending a different key than the API server expects

- **API server error about missing JS/CSS files**
  - The widget wasn’t built; run `npm -w @openstad-headless/api-server run build-packages`
  - Or the `js/css` entries in `apps/api-server/src/routes/widget/widget-settings.js` don’t match `packages/<widget>/dist/`

- **`require.resolve(...)` failures** in API logs
  - The widget package isn’t listed in `apps/api-server/package.json` dependencies
  - Or you haven’t run `npm i` after adding it

- **Browser console: `${functionName} is not defined`**
  - `functionName` doesn’t match the IIFE global (check `packages/<widget>/vite.config.ts` `build.lib.name`)

- **Browser console: `${functionName}.${componentName}.loadWidget is not a function`**
  - `componentName` mismatch OR your component didn’t set `Component.loadWidget = loadWidget`
