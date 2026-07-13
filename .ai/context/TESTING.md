# Testing

Three layers: Vitest unit tests, Cypress component tests, Cypress E2E. All commands run from the
repo root. See also [doc/testing.md](../../doc/testing.md).

## Unit tests (Vitest) — required

Unit tests **must** be added for new features/bugfixes and updated when changing existing
behavior.

- Root config `vitest.config.ts` defines projects over `apps/*`, `packages/*`,
  `packages/apostrophe-widgets/*`.
- Test files are **co-located** with the code they test and suffixed `.test.js` / `.test.ts` /
  `.test.tsx` (e.g. `src/services/spam-detector.test.js`,
  `src/lib/statistics/stats-helpers.test.ts`).

```bash
npm run test:unit             # everything
npm run test:unit:admin      # apps/admin-server
npm run test:unit:api        # apps/api-server
npm run test:unit:auth       # apps/auth-server
npm run test:unit:cms        # apps/cms-server
npm run test:unit:image      # apps/image-server
npm run test:unit:watch      # watch mode
npm run test:unit:coverage   # with coverage
```

**Legacy Jest**: api-server and auth-server still contain their own `jest.config.js` and
per-app jest scripts. These are legacy — the root Vitest scripts above are canonical. Write new
tests for Vitest.

## Component tests (Cypress) — strongly recommended for widgets/complex UI

- Spec pattern: `packages/**/cypress/component/**/*.cy.{js,jsx,ts,tsx}` (React + Vite dev
  server, configured in root `cypress.config.ts`).
- ~29 packages have component tests; `packages/ui` has the largest suite.

```bash
npm run test:component                  # all component tests
cd packages/<widget> && npm run test:component   # single package (scripts/run-package-component-tests.sh)
npm run cy:open                         # interactive runner
```

## E2E tests (Cypress)

- Located in root **`/cypress`** (not inside an app); config in `cypress.config.ts`, env from
  `.testing.env`.
- Coverage is currently minimal (admin login smoke test in `cypress/e2e/1-smoke-test/`).
- Requires the full stack running; CI boots it via `docker-compose.e2e.init.yml` +
  `docker-compose.e2e.yml` and waits for `/health` on all five services.

```bash
npm run test:e2e
```

## Accessibility

There is currently **no automated a11y harness** (no axe integration) — accessibility (WCAG 2.1
AA) is enforced through review; check semantic HTML, labels, keyboard navigation, and contrast
manually when changing UI. Adding `cypress-axe` checks to component tests is welcome for
significant UI work.

## CI (`.github/workflows/`)

| Workflow                   | Trigger                                                  | What it does                                                                                                                           |
| -------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `build-publish-docker.yml` | Push (all branches), PRs to `develop`/`main`/`release/*` | Prettier `format:check` → Vitest unit tests → Cypress component tests → Docker builder stage → per-app images to GHCR; E2E on PRs only |
| `create-release.yml`       | Manual dispatch (`release/*` branch + semver tag)        | Validates, tests, builds tagged images, lints/packages/pushes the Helm chart, creates a GitHub release                                 |

CI runs on Node 24 and installs with `@aikidosec/safe-chain` (supply-chain guard).
Formatting is a hard gate: run `npm run format:check` before pushing.
