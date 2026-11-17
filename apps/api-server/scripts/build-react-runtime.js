const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const outfile = path.resolve(__dirname, '../dist/openstad-react-runtime.js');

// Rebuild when the bundled react-dom version no longer matches, so a stale
// dist file (old image layer, persistent volume) can never keep serving an
// outdated runtime next to newer widget bundles.
const reactDomVersion = require('react-dom/package.json').version;
const versionMarker = `// react-dom@${reactDomVersion}`;

if (fs.existsSync(outfile)) {
  const firstLine = fs.readFileSync(outfile, 'utf8').split('\n', 1)[0];
  if (firstLine === versionMarker) {
    console.log(
      `React runtime already built for react-dom ${reactDomVersion}, skipping`
    );
    process.exit(0);
  }
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
      import * as ReactDOMServer from 'react-dom/server';
      import { createRoot, hydrateRoot } from 'react-dom/client';
      window.OpenStadReact = React;
      window.OpenStadReactDOM = { ...ReactDOM, createRoot, hydrateRoot };
      window.OpenStadReactDOMServer = ReactDOMServer;
    `,
      resolveDir: path.resolve(__dirname, '..'),
      loader: 'js',
    },
    bundle: true,
    format: 'iife',
    outfile,
    minify: true,
    banner: { js: versionMarker },
    define: { 'process.env.NODE_ENV': '"production"' },
  })
  .then(() => {
    console.log('React runtime built successfully');
  })
  .catch((err) => {
    console.error('Failed to build React runtime:', err);
    process.exit(1);
  });
