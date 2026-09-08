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

const require = createRequire(import.meta.url);
const db = require('../../db');
const submissionRouter = require('./submission');

const PROJECT_ID = 1;
let updated = null;

function buildSubmission() {
  const submission = db.Submission.build({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    projectId: PROJECT_ID,
    userId: 3,
    widgetId: 9,
    submittedData: { veld: 'oud' },
  });
  submission.update = async (values) => {
    updated = values;
    return submission;
  };
  return submission;
}

db.Submission.scope = () => ({
  findOne: async () => buildSubmission(),
  findAndCountAll: async () => ({ rows: [], count: 0 }),
});

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: PROJECT_ID, config: {} };
    req.dbQuery = {};
    req.scope = [];
    next();
  });
  app.use('/project/:projectId(\\d+)/submission', submissionRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const editor = { role: 'editor', id: 10 };
const url = `/project/${PROJECT_ID}/submission/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`;

describe('PUT submission', () => {
  beforeEach(() => {
    updated = null;
  });

  it('does not let an editor move a submission to another project', async () => {
    await request(createApp(editor)).put(url).send({ projectId: 2 });

    expect(updated?.projectId).toBeUndefined();
  });

  it('does not let an editor reassign userId or widgetId', async () => {
    await request(createApp(editor))
      .put(url)
      .send({ userId: 99, widgetId: 99 });

    expect(updated?.userId).toBeUndefined();
    expect(updated?.widgetId).toBeUndefined();
  });

  it('still applies the editable fields', async () => {
    await request(createApp(editor))
      .put(url)
      .send({ submittedData: { veld: 'nieuw' }, projectId: 2 });

    expect(updated.submittedData).toEqual({ veld: 'nieuw' });
  });

  it('refuses an unauthenticated update', async () => {
    const res = await request(createApp({ role: 'anonymous', id: null }))
      .put(url)
      .send({ submittedData: { veld: 'poc' } });

    expect(res.status).toBe(403);
    expect(updated).toBeNull();
  });
});
