import react from '@vitejs/plugin-react';
import { type UserConfig, defineConfig } from 'vite';

import { prefix } from './prefix';

export interface WidgetConfigOptions {
  /** IIFE global name, e.g. 'OpenstadHeadlessForm' */
  name: string;
  /** Entry file path relative to package, e.g. 'src/form.tsx' */
  entry: string;
  /** Use CSS prefix (.openstad scoping). Default: true */
  usePrefix?: boolean;
  /** Include process.env.NODE_ENV define. Default: true */
  defineNodeEnv?: boolean;
  /** Include remixicon in externals. Default: true */
  externalRemixicon?: boolean;
  /** Additional rollupOptions.output overrides */
  outputOverrides?: Record<string, unknown>;
  /** Additional build.lib overrides (e.g. fileName) */
  libOverrides?: Record<string, unknown>;
  /** Additional build overrides (e.g. outDir) */
  buildOverrides?: Record<string, unknown>;
  /** Bundle React into the output instead of externalizing. Default: false */
  bundleReact?: boolean;
}

export function createWidgetConfig(options: WidgetConfigOptions) {
  const {
    name,
    entry,
    usePrefix = true,
    defineNodeEnv = true,
    externalRemixicon = true,
    outputOverrides = {},
    libOverrides = {},
    buildOverrides = {},
    bundleReact = false,
  } = options;

  return defineConfig(({ command }) => {
    const config: UserConfig = {
      plugins: [react(command === 'serve' ? {} : { jsxRuntime: 'classic' })],
    };

    if (usePrefix) {
      config.css = prefix();
    }

    if (command === 'serve') {
      return config;
    }

    if (defineNodeEnv) {
      config.define = { 'process.env.NODE_ENV': '"production"' };
    }

    const external: string[] = bundleReact
      ? []
      : ['react', 'react-dom', 'react-dom/client'];
    if (externalRemixicon) {
      external.push('remixicon/fonts/remixicon.css');
    }

    const rollupOutput: Record<string, unknown> = bundleReact
      ? { ...outputOverrides }
      : {
          globals: {
            react: 'OpenStadReact',
            'react-dom': 'OpenStadReactDOM',
            'react-dom/client': 'OpenStadReactDOM',
          },
          ...outputOverrides,
        };

    config.build = {
      lib: {
        formats: ['iife'],
        entry,
        name,
        ...libOverrides,
      },
      rollupOptions: {
        external,
        output: rollupOutput,
      },
      ...buildOverrides,
    };

    return config;
  });
}
