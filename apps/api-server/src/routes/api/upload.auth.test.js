import express from 'express';
import { createRequire } from 'node:module';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

process.env.IMAGE_APP_URL_INTERNAL =
  process.env.IMAGE_APP_URL_INTERNAL || 'http://127.0.0.1:65535';
process.env.IMAGE_VERIFICATION_TOKEN =
  process.env.IMAGE_VERIFICATION_TOKEN || 'test-token';

const require = createRequire(import.meta.url);
const uploadRouter = require('./upload');

function createApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use('/project/:projectId(\\d+)/upload', uploadRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('upload route authorization', () => {
  it('rejects anonymous upload requests', async () => {
    process.env.API_UPLOAD_LEGACY_AUTH_BYPASS = 'false';
    const res = await request(createApp({ role: 'anonymous', id: null }))
      .post('/project/1/upload/image')
      .send('file-bytes');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  it('allows opting into legacy upload bypass', async () => {
    process.env.API_UPLOAD_LEGACY_AUTH_BYPASS = 'true';
    const res = await request(createApp({ role: 'anonymous', id: null }))
      .post('/project/1/upload/image')
      .send('file-bytes');

    expect(res.status).not.toBe(401);
  });
});
