import { defineConfig } from 'cypress';
// Load environment variables from .testing.env file
import dotenv from 'dotenv';

dotenv.config({ path: '.testing.env' });
// Cypress configuration

export default defineConfig({
  projectId: 'vqxz36',

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  env: { ...process.env },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
