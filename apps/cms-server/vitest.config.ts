import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Keep Vitest's default excludes (node_modules, dist, …) and add the
    // vendored Bootstrap test suite (needs a browser env, not ours) and the
    // Apostrophe build output.
    exclude: [...configDefaults.exclude, '**/vendor/**', 'apos-build/**'],
  },
});
