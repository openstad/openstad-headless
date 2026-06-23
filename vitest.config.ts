import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['apps/*', 'packages/*', 'packages/apostrophe-widgets/*'],
    // Coverage MUST be configured at the workspace root: in Vitest projects mode
    // per-project `coverage` blocks are ignored, so the thresholds below are the
    // single source of truth that gates CI.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Scope coverage to the critical flows that currently have dedicated tests
      // (issue #1642). Add a file here once it gains real test coverage so the
      // threshold reflects intentionally-tested code rather than the whole repo.
      include: [
        'apps/api-server/src/middleware/user.js',
        'apps/api-server/src/middleware/project.js',
        'apps/api-server/src/lib/deadlock-retry.js',
        'apps/api-server/src/lib/sequelize-authorization/lib/hasRole.js',
        'apps/api-server/src/lib/sequelize-authorization/middleware/index.js',
        'apps/api-server/src/routes/api/vote.js',
        'apps/api-server/src/routes/api/pending-budget-vote.js',
        'apps/api-server/src/routes/api/resource.js',
        'apps/auth-server/controllers/oauth/oauth2.js',
        'apps/auth-server/controllers/oauth/allowed-domains.js',
        'apps/auth-server/controllers/auth/local.js',
        'apps/auth-server/controllers/auth/url.js',
      ],
      // Baseline gate per issue #1642 (start at 20% lines). A failing threshold
      // fails `vitest run --coverage`, which blocks the CI build. Ratchet upwards
      // as coverage improves.
      thresholds: {
        lines: 20,
        statements: 20,
        functions: 20,
        branches: 20,
      },
    },
  },
});
