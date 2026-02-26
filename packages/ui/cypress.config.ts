import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'vqxz36',
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
});
