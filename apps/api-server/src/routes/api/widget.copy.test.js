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
const db = require('../../db');
const widgetRouter = require('./widget');

const TARGET = 9;

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: TARGET, config: {} };
    req.dbQuery = {};
    next();
  });
  app.use('/project/:projectId(\\d+)/widgets', widgetRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const superuser = { role: 'superuser', id: 1 };
const editor = {
  role: 'editor',
  id: 10,
  idpUser: { identifier: 'abc', provider: 'openstad' },
};

function post(user, body) {
  return request(createApp(user))
    .post(`/project/${TARGET}/widgets/copy`)
    .send(body);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /project/:projectId/widgets/copy', () => {
  it.each([
    [{ sourceProjectId: 0, ids: [1] }],
    [{ sourceProjectId: '2', ids: [1] }],
    [{ sourceProjectId: TARGET, ids: [1] }],
    [{ sourceProjectId: 2, ids: [] }],
    [{ sourceProjectId: 2, ids: ['1'] }],
  ])('refuses invalid input %j', async (body) => {
    const res = await post(superuser, body);

    expect(res.status).toBe(400);
  });

  it('refuses a user who is not admin or editor of the source project', async () => {
    const findOne = vi.spyOn(db.User, 'findOne').mockResolvedValue(null);

    const res = await post(editor, { sourceProjectId: 2, ids: [1] });

    expect(res.status).toBe(403);
    expect(findOne.mock.calls[0][0].where.projectId).toBe(2);
  });

  it('refuses a user who is not admin or editor of the target project', async () => {
    const findOne = vi
      .spyOn(db.User, 'findOne')
      .mockImplementation(async ({ where }) =>
        where.projectId === 2 ? { id: 3 } : null
      );

    const res = await post(editor, { sourceProjectId: 2, ids: [1] });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('into this project');
    expect(findOne.mock.calls[1][0].where.projectId).toBe(TARGET);
  });

  it('answers 404 when none of the ids belong to the source project', async () => {
    const findAll = vi.spyOn(db.Widget, 'findAll').mockResolvedValue([]);

    const res = await post(superuser, { sourceProjectId: 2, ids: [1, 2] });

    expect(res.status).toBe(404);
    expect(findAll.mock.calls[0][0].where).toEqual({
      id: [1, 2],
      projectId: 2,
    });
  });
});
