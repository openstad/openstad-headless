const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },

  ignorePatterns: [
    'node_modules/',
    'dist/',
    'vite.config.ts',
    'vite-env.d.ts',
    '/src/main.tsx',
  ],
  rules: {
    'unicorn/filename-case': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
  },
};
