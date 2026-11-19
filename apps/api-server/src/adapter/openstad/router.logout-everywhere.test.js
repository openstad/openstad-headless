import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const config = require('config');
const db = require('../../db');

const PROJECT_ID = 4;
const IDP_USER = { identifier: 42, provider: 'openstad' };

function loadRouter({ multiProjectLogin }) {
  if (multiProjectLogin) {
    process.env.MULTI_PROJECT_LOGIN = 'true';
  } else {
    delete process.env.MULTI_PROJECT_LOGIN;
  }
  delete require.cache[require.resolve('./router')];
  return require('./router');
}

function createApp({ router, user = { role: 'anonymous', id: null } }) {
  const app = express();
  app.use((req, res, next) => {
    req.project = { id: PROJECT_ID, config: {} };
    req.authConfig = { provider: 'openstad' };
    req.user = user;
    next();
  });
  app.use(router);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

let upsert;
beforeEach(() => {
  upsert = vi.spyOn(db.LoginRevocation, 'upsert').mockResolvedValue([{}]);
});

afterEach(() => {
  delete process.env.MULTI_PROJECT_LOGIN;
  vi.restoreAllMocks();
});

describe('POST logout everywhere', () => {
  it('does not exist without multi-project login', async () => {
    const router = loadRouter({ multiProjectLogin: false });
    const user = { id: 5, projectId: PROJECT_ID, idpUser: { ...IDP_USER } };

    const res = await request(createApp({ router, user }))
      .post(`/project/${PROJECT_ID}/logout`)
      .timeout(2000);

    expect(res.status).toBe(404);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('requires a logged in user', async () => {
    const router = loadRouter({ multiProjectLogin: true });

    const res = await request(createApp({ router }))
      .post(`/project/${PROJECT_ID}/logout`)
      .timeout(2000);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ status: 'not_logged_in' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('requires a user with an identity at the auth server', async () => {
    const router = loadRouter({ multiProjectLogin: true });
    const user = { id: 5, projectId: PROJECT_ID, idpUser: {} };

    const res = await request(createApp({ router, user }))
      .post(`/project/${PROJECT_ID}/logout`)
      .timeout(2000);

    expect(res.status).toBe(401);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('skips the revocation for a user of the admin project', async () => {
    const router = loadRouter({ multiProjectLogin: true });
    const user = {
      id: 5,
      projectId: config.admin.projectId,
      idpUser: { ...IDP_USER },
    };

    const res = await request(createApp({ router, user }))
      .post(`/project/${PROJECT_ID}/logout`)
      .timeout(2000);

    expect(res.status).toBe(204);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('writes a revocation for the identity of a project user', async () => {
    const router = loadRouter({ multiProjectLogin: true });
    const user = { id: 5, projectId: PROJECT_ID, idpUser: { ...IDP_USER } };

    const res = await request(createApp({ router, user }))
      .post(`/project/${PROJECT_ID}/logout`)
      .timeout(2000);

    expect(res.status).toBe(204);
    expect(upsert).toHaveBeenCalledWith({
      provider: 'openstad',
      identifier: '42',
      revokedAt: expect.any(Date),
    });
  });

  it('leaves the GET logout untouched', async () => {
    const router = loadRouter({ multiProjectLogin: true });

    const res = await request(createApp({ router }))
      .get(`/project/${PROJECT_ID}/logout`)
      .query({ ipdlogout: '1' })
      .timeout(2000);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ logout: 'success' });
    expect(upsert).not.toHaveBeenCalled();
  });
});
