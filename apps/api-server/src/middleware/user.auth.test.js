import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const userMw = require('./user');

function createApp() {
  const app = express();
  app.use((req, res, next) => {
    req.project = { id: 1, config: {} };
    next();
  });
  app.use(userMw);
  app.get('/probe', (req, res) => {
    res.json(req.user);
  });
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('auth middleware fallback user', () => {
  it('returns anonymous user without authorization header', async () => {
    const res = await request(createApp()).get('/probe');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ role: 'anonymous', id: null });
  });

  it('returns anonymous user for malformed bearer token', async () => {
    const res = await request(createApp())
      .get('/probe')
      .set('Authorization', 'Bearer this-is-not-a-jwt');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ role: 'anonymous', id: null });
  });
});
