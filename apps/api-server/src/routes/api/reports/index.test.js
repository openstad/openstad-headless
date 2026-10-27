import express from 'express';
import path from 'path';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

// Redirect the package import to the local worktree file so tests can run
// before npm install has updated the shared node_modules (same seam used by
// api-token-scope-guard.test.js).
vi.mock('@openstad-headless/lib/report-data-scope', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(
    path.resolve(__dirname, '../../../../../../packages/lib/report-data-scope')
  );
});

const reportsRouter = require('./index');

function makeApp() {
  const app = express();
  // Mirrors security-headers.js, which is mounted globally in Server.js
  // BEFORE this router and unconditionally sets this header on every
  // response — needed to exercise the /openapi.json wildcard-CORS fix
  // against the same conflict it has to clear in the real app.
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Credentials', 'true');
    next();
  });
  app.use('/api/project/:projectId/reports/v1', reportsRouter);
  return app;
}

describe('reports router — cross-cutting wiring', () => {
  it('serves a valid OpenAPI spec at /openapi.json without a reporting token', async () => {
    const res = await request(makeApp()).get(
      '/api/project/1/reports/v1/openapi.json'
    );
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(Object.keys(res.body.paths)).toHaveLength(12);
  });

  it('sets the API-Version header on every response, including /openapi.json', async () => {
    const res = await request(makeApp()).get(
      '/api/project/1/reports/v1/openapi.json'
    );
    expect(res.headers['api-version']).toBe('1.0.0');
  });

  it('sets a wildcard Access-Control-Allow-Origin on /openapi.json regardless of environment (NLgov ADR: the spec must be fetchable cross-origin)', async () => {
    const res = await request(makeApp()).get(
      '/api/project/1/reports/v1/openapi.json'
    );
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('clears Access-Control-Allow-Credentials on /openapi.json — the Fetch/CORS spec forbids combining it with a wildcard origin', async () => {
    const res = await request(makeApp()).get(
      '/api/project/1/reports/v1/openapi.json'
    );
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });

  it('401s a data endpoint with no reporting token, as application/problem+json', async () => {
    const res = await request(makeApp()).get(
      '/api/project/1/reports/v1/resources'
    );
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body).toEqual({
      type: 'https://developer.overheid.nl/api-design-rules/problem/401',
      title: 'A valid reporting API token is required',
      status: 401,
    });
    // The API-Version header middleware runs before the auth gate, so it's
    // still present even on this 401.
    expect(res.headers['api-version']).toBe('1.0.0');
  });
});
