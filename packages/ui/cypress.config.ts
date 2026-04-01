import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'vqxz36',
  allowCypressEnv: false,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
