import react from '@vitejs/plugin-react';
import { defineConfig } from 'cypress';
// Load environment variables from .testing.env file
import dotenv from 'dotenv';

dotenv.config({ path: '.testing.env' });
// Cypress configuration

export default defineConfig({
  projectId: 'vqxz36',
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  env: { ...process.env },
  expose: {
    ADMIN_URL: process.env.ADMIN_URL,
    AUTH_APP_URL: process.env.AUTH_APP_URL,
    AUTH_FIRST_LOGIN_CODE: process.env.AUTH_FIRST_LOGIN_CODE,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        plugins: [react()],
      },
    },
    specPattern: 'packages/**/cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
});
