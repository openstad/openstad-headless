import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,ts}'],
    setupFiles: [path.resolve(__dirname, '../../vitest.setup.js')],
    env: {
      NODE_CONFIG_DIR: path.resolve(__dirname, 'config'),
    },
    // Coverage (include scope + thresholds) is configured once at the repo root
    // (/vitest.config.ts). Vitest ignores per-project coverage config in projects
    // mode, so defining it here would be dead, misleading config.
  },
  resolve: {
    alias: {
      // Resolve @openstad-headless/lib to the local packages/lib so that
      // new modules added in this worktree are visible to tests before
      // node_modules is re-installed.
      '@openstad-headless/lib': path.resolve(__dirname, '../../packages/lib'),
    },
  },
});
