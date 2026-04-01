import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // When running in dev mode, use the React plugin
  if (command === 'serve') {
    return {
      plugins: [react()],
    };
    // During build, use the classic runtime and build as an IIFE so we can deliver it to the browser
  } else {
    return {
      plugins: [react({ jsxRuntime: 'classic' })],
      define: { 'process.env.NODE_ENV': '"production"' },
      build: {
        lib: {
          formats: ['iife'],
          entry: 'src/carousel.tsx',
          name: 'ApostropheWidgetsCarousel',
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react-dom/client',
            'remixicon/fonts/remixicon.css',
          ],
          output: {
            globals: {
              react: 'OpenStadReact',
              'react-dom': 'OpenStadReactDOM',
              'react-dom/client': 'OpenStadReactDOM',
            },
          },
        },
      },
    };
  }
});
