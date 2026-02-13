import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

import { prefix } from '../lib/prefix';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()],
      css: prefix(),
    };
  } else {
    return {
      plugins: [react({ jsxRuntime: 'classic' })],
      css: prefix(),
      define: { 'process.env.NODE_ENV': '"production"' },
      build: {
        lib: {
          formats: ['iife'],
          entry: path.resolve(__dirname, 'src/choiceguide-results.tsx'), // Correct path to your entry file
          name: 'OpenstadHeadlessChoiceGuideResults',
          fileName: 'choiceguide-results',
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
        outDir: 'dist', // Ensures output is in the dist directory
      },
    };
  }
});
