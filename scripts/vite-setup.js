import react from '@vitejs/plugin-react';

export function viteSetup(command, entryName, name) {
  // When running in dev mode, use the React plugin
  if (command === 'serve') {
    return {
      plugins: [react()],
    };
    // During build, use the classic runtime and build as an IIFE so we can deliver it to the browser
  } else {
    return {
      plugins: [react({ jsxRuntime: 'classic' })],
      build: {
        lib: {
          formats: ['iife'],
          entry: `src/${entryName}.tsx`,
          name: name,
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'remixicon/fonts/remixicon.css',
            '@utrecht/component-library-css',
            '@utrecht/design-tokens/dist/root.css',
          ],
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
}
