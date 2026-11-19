import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const submissionRouter = require('./submission');

const submissionCreate = vi.fn(async (data) => ({
  id: 12,
  ...data,
  toJSON: () => ({ id: 12 }),
}));
let projectConfig;

db.Submission.create = submissionCreate;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { role: 'anonymous', id: null };
    req.project = { id: 1, config: projectConfig };
    next();
  });
  app.use('/project/:projectId(\\d+)/submission', submissionRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const submit = () =>
  request(createApp())
    .post('/project/1/submission')
    .send({ submittedData: { answer: 'x' } });

describe('POST submission on an ended project', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuses the submission when the project has ended', async () => {
    projectConfig = { project: { projectHasEnded: true } };

    const res = await submit();

    expect(res.status).toBe(401);
    expect(submissionCreate).not.toHaveBeenCalled();
  });

  it('accepts the submission while the project is active', async () => {
    projectConfig = { project: { projectHasEnded: false } };

    const res = await submit();

    expect(res.status).toBe(200);
    expect(submissionCreate).toHaveBeenCalled();
  });
});
