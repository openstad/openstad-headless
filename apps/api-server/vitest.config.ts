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
    // node-config resolves its config dir from process.cwd(); without this the
    // suites that import src/db.js fail to collect when vitest runs from the
    // repo root (as CI does).
    env: { NODE_CONFIG_DIR: path.resolve(__dirname, 'config') },
  },
});
