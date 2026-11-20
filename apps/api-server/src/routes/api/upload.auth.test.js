import express from 'express';
import { createRequire } from 'node:module';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A high global limit must not raise the upload route's own quota.
process.env.RATE_LIMIT = '100000';
process.env.RATE_WINDOW_MS = '60000';
process.env.IMAGE_APP_URL_INTERNAL =
  process.env.IMAGE_APP_URL_INTERNAL || 'http://127.0.0.1:65535';
process.env.IMAGE_VERIFICATION_TOKEN =
  process.env.IMAGE_VERIFICATION_TOKEN || 'test-token';

const require = createRequire(import.meta.url);
const db = require('../../db');
const uploadRouter = require('./upload');
const acceptingRouter = uploadRouter.createUploadRouter((req, res) => {
  res.status(200).json({ proxied: true });
});

const originalFindAll = db.Widget.findAll;

function createApp(user, router = uploadRouter) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    const match = req.path.match(/\/project\/(\d+)/);
    if (match) req.project = { id: Number(match[1]) };
    next();
  });
  app.use('/project/:projectId(\\d+)/upload', router);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

function widgetsForProject(projectId) {
  db.Widget.findAll = vi.fn(async ({ where }) => {
    if (Number(where.projectId) !== projectId) return [];
    return [{ id: 1, config: { items: [{ questionType: 'imageUpload' }] } }];
  });
}

describe('upload route authorization', () => {
  afterEach(() => {
    db.Widget.findAll = originalFindAll;
  });

  it('rejects an anonymous upload on a project without upload widgets', async () => {
    db.Widget.findAll = vi.fn().mockResolvedValue([]);

    const res = await request(createApp({ role: 'anonymous', id: null }))
      .post('/project/1/upload/image')
      .send('file-bytes');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  it('allows an anonymous upload only on a project with an upload widget', async () => {
    widgetsForProject(1);
    const app = createApp({ role: 'anonymous', id: null }, acceptingRouter);

    const allowed = await request(app).post('/project/1/upload/image');
    const refused = await request(app).post('/project/2/upload/image');

    expect(allowed.status).toBe(200);
    expect(refused.status).toBe(401);
    expect(refused.text).toBe('Unauthorized');
  });

  it('rejects a logged-in user who has no access to the project', async () => {
    const res = await request(
      createApp({ id: 5, role: 'member', projectId: 2 })
    ).post('/project/1/upload/document');

    expect(res.status).toBe(403);
    expect(res.text).toBe('Forbidden');
  });

  it('accepts a logged-in user of the project', async () => {
    const res = await request(
      createApp({ id: 5, role: 'member', projectId: 1 }, acceptingRouter)
    ).post('/project/1/upload/image');

    expect(res.status).toBe(200);
  });

  it('returns 429 on the 21st upload from one public IP regardless of RATE_LIMIT', async () => {
    const app = createApp({ id: 5, role: 'member', projectId: 1 });
    // trust proxy must be a hop count. `true` makes express-rate-limit refuse
    // to run, and the default `false` ignores X-Forwarded-For.
    app.set('trust proxy', 1);

    const send = () =>
      request(app)
        .post('/project/1/upload/image')
        .set('X-Forwarded-For', '203.0.113.10');

    for (let n = 0; n < 20; n += 1) {
      const res = await send();
      expect(res.status).not.toBe(429);
    }

    const blocked = await send();
    expect(blocked.status).toBe(429);
  });
});
