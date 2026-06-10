import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,ts}'],
    env: {
      NODE_CONFIG_DIR: path.resolve(__dirname, 'config'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      // Scope to files that have corresponding test coverage
      include: [
        'src/middleware/user.js',
        'src/middleware/project.js',
        'src/lib/deadlock-retry.js',
        'src/lib/sequelize-authorization/lib/hasRole.js',
        'src/lib/sequelize-authorization/middleware/index.js',
        'src/routes/api/vote.js',
        'src/routes/api/pending-budget-vote.js',
        'src/routes/api/resource.js',
      ],
      thresholds: {
        lines: 50,
        statements: 50,
        branches: 45,
        functions: 50,
      },
    },
  },
});
