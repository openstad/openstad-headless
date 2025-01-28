import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import prefixer from 'postcss-prefix-selector';
import autoprefixer from 'autoprefixer';


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
      css: {
        postcss: {
          plugins: [
            prefixer({
              prefix: '.openstad',
              transform(prefix, selector, prefixedSelector, filePath, rule) {
                if (selector.match(/^(html|body)/)) {
                  return selector.replace(/^([^\s]*)/, `$1 ${prefix}`);
                }

                if (selector.match(/^(:root)/)) {
                  return selector.replace(/^([^\s]*)/, `${prefix}`);
                }
    
                if (filePath.match(/node_modules/)) {
                  return selector;
                }
    
                const annotation = rule.prev();
                if (annotation?.type === 'comment' && annotation.text.trim() === 'no-prefix') {
                  return selector;
                }
    
                return prefixedSelector;
              },
            }),
            autoprefixer({})
          ],
        }
      },
      build: {
        lib: {
          formats: ['iife'],
          entry: 'src/resource-overview.tsx',
          name: 'OpenstadHeadlessResourceOverview',
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
