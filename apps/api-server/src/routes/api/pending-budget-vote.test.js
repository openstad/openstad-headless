import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';
// Mimic an installation with a very high global limit
process.env.RATE_LIMIT = '75000';

const require = createRequire(import.meta.url);
const db = require('../../db');
const pendingRouter = require('./pending-budget-vote');

let created = null;

db.PendingBudgetVote.create = async (values) => {
  created = values;
  return values;
};

function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/pending-budget-vote', pendingRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('POST /pending-budget-vote', () => {
  beforeEach(() => {
    created = null;
  });

  it('accepts a realistic selection', async () => {
    const res = await request(createApp())
      .post('/pending-budget-vote')
      .send({ 101: 1, 102: 1, 103: 1 });

    expect(res.status).toBe(200);
    expect(created.data).toEqual({ 101: 1, 102: 1, 103: 1 });
  });

  it('refuses a payload beyond the cap', async () => {
    const oversized = { blob: 'a'.repeat(64 * 1024 + 1) };

    const res = await request(createApp())
      .post('/pending-budget-vote')
      .send(oversized);

    expect(res.status).toBe(413);
    expect(created).toBeNull();
  });

  it('refuses a non-object payload', async () => {
    const res = await request(createApp())
      .post('/pending-budget-vote')
      .set('Content-Type', 'application/json')
      .send('"kaas"');

    expect(res.status).toBe(400);
    expect(created).toBeNull();
  });
});

describe('POST /pending-budget-vote rate limit', () => {
  it('blocks the 31st request from one public IP within the window', async () => {
    // One app for all requests so they share the limiter store
    const app = createApp();
    app.set('trust proxy', true);
    const post = () =>
      request(app)
        .post('/pending-budget-vote')
        .set('X-Forwarded-For', '203.0.113.10')
        .send({ 101: 1 });

    for (let i = 0; i < 30; i++) {
      expect((await post()).status).toBe(200);
    }

    created = null;
    const res = await post();
    expect(res.status).toBe(429);
    expect(created).toBeNull();
  });
});
