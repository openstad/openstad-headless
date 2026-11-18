import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.{js,ts}'],
    // Two setup files run before every test file:
    // 1. ./test/setup.js generates an ephemeral, test-only JWT keypair in memory
    //    so cert-dependent code loads without on-disk certs.
    // 2. ../../vitest.setup.js quietens cosmetic third-party noise (deprecations,
    //    node-config warning) — no application behaviour is changed.
    setupFiles: [
      './test/setup.js',
      path.resolve(__dirname, '../../vitest.setup.js'),
    ],
    // Coverage (include scope + thresholds) is configured once at the repo root
    // (/vitest.config.ts). Vitest ignores per-project coverage config in projects
    // mode, so defining it here would be dead, misleading config.
  },
});
