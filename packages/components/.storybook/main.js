import { join, dirname } from 'path';
import webpackConfig from '../webpack.config.js';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-interactions'),
    '@storybook/addon-styling-webpack',
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async webpackFinal(config, { configType }) {
    const finalConfig = {
      ...config,
      plugins: [...config.plugins, ...webpackConfig.plugins],
      module: {
        ...config.module,
        rules: [...config.module.rules, ...webpackConfig.module.rules],
      },
    };
    return finalConfig;
  },
};

export default config;
