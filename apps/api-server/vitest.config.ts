import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Resolve @openstad-headless/lib to the local packages/lib so that
      // new modules added in this worktree are visible to tests before
      // node_modules is re-installed.
      '@openstad-headless/lib': path.resolve(__dirname, '../../packages/lib'),
    },
  },
  test: {
    environment: 'node',
  },
});
