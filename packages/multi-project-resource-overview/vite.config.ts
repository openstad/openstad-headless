import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {prefix} from '../lib/prefix';
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const alias = {
    '@': path.resolve(__dirname, '../../apps/admin-server/src'),
  };

  // When running in dev mode, use the React plugin
  if (command === 'serve') {
    return {
      plugins: [react()],
      css: prefix(),
      resolve: { alias },
    };
    // During build, use the classic runtime and build as an IIFE so we can deliver it to the browser
  } else {
    return {
      plugins: [react({ jsxRuntime: 'classic' })],
      css: prefix(),
      resolve: { alias },
      build: {
        lib: {
          formats: ['iife'],
          entry: 'src/multi-project-resource-overview.tsx',
          name: 'OpenstadHeadlessMultiProjectResourceOverview',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'remixicon/fonts/remixicon.css'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
    };
  }
});
