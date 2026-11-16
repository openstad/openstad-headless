import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

describe('GET digest-login redirect checks', () => {
  afterEach(() => vi.restoreAllMocks());

  const loggedRefusal = (log) =>
    log.mock.calls
      .map((call) => String(call[0]))
      .find((line) => line.includes('[digest-login]'));

  it('tags the redirect with the project id of the request, not the raw route parameter', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    const res = await request(createApp())
      .get('/project/4%26x%3D1/digest-login')
      .query({ returnTo: 'https://elsewhere.example.com/page' })
      .timeout(2000);

    expect(res.status).toBe(500);
    expect(loggedRefusal(log)).toContain('openstadprojectid=4');
    expect(loggedRefusal(log)).not.toContain('x=1');
  });

  it('says that https is required when the domain is allowed but the url is plain http in production', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    delete process.env.FORCE_HTTP;

    try {
      const res = await request(createApp())
        .get('/project/4/digest-login')
        .query({ returnTo: 'http://site.example.com/page' })
        .timeout(2000);

      expect(res.body).toEqual({ status: 'Redirect url must use https' });
      expect(loggedRefusal(log)).toContain('https required');
    } finally {
      process.env.NODE_ENV = env;
    }
  });
});
