## Widget workflow (preview in admin)

This page is extracted from the old `doc/getting-started.md` deep-dive so the Docker quickstart can stay short.

Phase 5 will expand this into a complete widget workflow (build/preview/add-a-widget).

### Admin server: widget management page previews

Each widget management page shows a preview of how the widget will look with a set of configurations.

In development, the preview only works after you build the widget in its package directory (under `packages/<widget>`). In production, widgets are already prebuilt.

### Getting the widget preview to work

There are a few steps to follow when trying to get a new widget rendered for the preview component:

- In `widget-settings.js` define how the api-server should bundle the widget. For example:

  ```js
  resourceoverview: {
    js: ['@openstad-headless/resource-overview/dist/resource-overview.iife.js'],
    css: ['@openstad-headless/resource-overview/dist/style.css'],
    functionName: 'OpenstadHeadlessResourceOverview',
    componentName: 'ResourceOverview', // must match the actual component name
    defaultConfig: {
      projectId: null,
    },
  }
  ```

- In `widget-preview.tsx` make sure the widget type is included in the `type` key of the `Props` definition. This key is used by the widget-preview route in the api-server to decide which widget to package.

  ```ts
  type Props = {
    type:
      | 'likes'
      | 'comments'
      | 'resourceoverview'
      | 'resourceform'
      | 'begrootmodule'
      | 'resourcesmap'
      | 'map'
      | 'keuzewijzer';
    // ...
  };
  ```

- In the api-server, add the widget package name to `package.json` dependencies, for example:

  `"@openstad-headless/resource-overview": "file:../../packages/resource-overview"`

- Tell Vite how you want to build the React widget by adding configuration to the widget package `vite.config.ts` (replace the widget name):

  ```ts
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
  ```

In development, the preview will only work after you build the widget (for example: `npm run build` in the widget package). If you see errors about missing dependencies (for example Rollup), try running `npm install` in the specific widget package.
