import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.{js,ts}'],
    // Runs before every test file: generates an ephemeral, test-only JWT
    // keypair in memory so cert-dependent code loads without on-disk certs
    // (see test/setup.js).
    setupFiles: ['./test/setup.js'],
    // Coverage (include scope + thresholds) is configured once at the repo root
    // (/vitest.config.ts). Vitest ignores per-project coverage config in projects
    // mode, so defining it here would be dead, misleading config.
  },
});
