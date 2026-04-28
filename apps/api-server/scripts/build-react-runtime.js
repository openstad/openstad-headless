const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const outfile = path.resolve(__dirname, '../dist/openstad-react-runtime.js');

if (fs.existsSync(outfile)) {
  console.log('React runtime already built, skipping');
  process.exit(0);
}

const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

esbuild
  .build({
    stdin: {
      contents: `
      import * as React from 'react';
      import * as ReactDOM from 'react-dom';
      import { createRoot, hydrateRoot } from 'react-dom/client';
      window.OpenStadReact = React;
      window.OpenStadReactDOM = { ...ReactDOM, createRoot, hydrateRoot };
    `,
      resolveDir: path.resolve(__dirname, '..'),
      loader: 'js',
    },
    bundle: true,
    format: 'iife',
    outfile,
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
  })
  .then(() => {
    console.log('React runtime built successfully');
  })
  .catch((err) => {
    console.error('Failed to build React runtime:', err);
    process.exit(1);
  });
