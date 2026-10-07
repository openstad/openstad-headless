import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const router = require('./router');

function createApp() {
  const app = express();
  app.use((req, res, next) => {
    req.project = {
      id: 4,
      url: 'https://site.example.com',
      config: { allowedDomains: ['site.example.com'] },
    };
    req.authConfig = { provider: 'openstad' };
    next();
  });
  app.use(router);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('GET digest-login', () => {
  it('answers 403 instead of crashing when the auth code is missing', async () => {
    const res = await request(createApp())
      .get('/project/4/digest-login')
      .query({ returnTo: 'https://site.example.com/page' })
      .timeout(2000);

    expect(res.status).toBe(403);
  });
});
