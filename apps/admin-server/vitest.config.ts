import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vitest does not read tsconfig `paths`, so the `@/` alias the app uses has
  // to be declared here or every test importing `@/...` fails to resolve.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // Node by default: most tests here are pure functions. A test that needs a
    // DOM opts in per file with a `// @vitest-environment jsdom` docblock.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Coverage (include scope + thresholds) is configured once at the repo root
    // (/vitest.config.ts). Vitest ignores per-project coverage config in projects
    // mode, so defining it here would be dead, misleading config.
  },
});
