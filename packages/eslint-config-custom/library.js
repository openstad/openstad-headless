const { resolve } = require('node:path');

// const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/typescript',
    '@vercel/style-guide/eslint/react',
  ].map(require.resolve),
  parserOptions: {
    project: ['../configs/tsconfig.eslint.json'],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: ['../configs/tsconfig.eslint.json'],
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
    // Nieuwe dangerouslySetInnerHTML-sites moeten door sanitizeHtml
    // (@openstad-headless/lib/sanitize); de warning dwingt review af.
    'react/no-danger': ['warn'],
  },
};
