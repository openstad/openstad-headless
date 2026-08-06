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

const OWNING_PROJECT = 1;
const OTHER_PROJECT = 2;
const editor = { role: 'editor', id: 10 };

// Every record belongs to OWNING_PROJECT and must not resolve via another.
let lastWhere = null;

// An unscoped where returns the record anyway, so the test fails without the fix.
function findOneStub(build) {
  return async (query) => {
    lastWhere = query.where;
    if (query.where.projectId === undefined) return build();
    return Number(query.where.projectId) === OWNING_PROJECT ? build() : null;
  };
}

function scopedFinder(build) {
  return () => ({ findOne: findOneStub(build) });
}

const buildAction = () =>
  db.Action.build({ id: 5, projectId: OWNING_PROJECT, type: 'x' });

db.Action.scope = scopedFinder(buildAction);
db.Action.findOne = findOneStub(buildAction);

db.NotificationTemplate.scope = scopedFinder(() =>
  db.NotificationTemplate.build({ id: 5, projectId: OWNING_PROJECT })
);

db.Notification.scope = scopedFinder(() =>
  db.Notification.build({ id: 5, projectId: OWNING_PROJECT })
);

function createApp(router, mountPath) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = editor;
    req.project = { id: Number(req.path.split('/')[2]) || 1, config: {} };
    req.dbQuery = {};
    req.scope = [];
    next();
  });
  app.use(mountPath, router);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const cases = [
  {
    name: 'action',
    router: () => require('./action'),
    mount: '/project/:projectId(\\d+)/action',
    url: (projectId) => `/project/${projectId}/action/5`,
  },
  {
    name: 'notification template',
    router: () => require('../notification/template'),
    mount: '/project/:projectId(\\d+)/template',
    url: (projectId) => `/project/${projectId}/template/5`,
  },
  {
    name: 'notification',
    router: () => require('../notification/notification'),
    mount: '/project/:projectId(\\d+)/notification',
    url: (projectId) => `/project/${projectId}/notification/5`,
  },
];

describe.each(cases)('$name single-record lookup', ({ router, mount, url }) => {
  beforeEach(() => {
    lastWhere = null;
  });

  it('constrains the query to the project in the url', async () => {
    await request(createApp(router(), mount)).get(url(OWNING_PROJECT));

    expect(lastWhere).toMatchObject({ projectId: String(OWNING_PROJECT) });
  });

  it('does not resolve a record from another project', async () => {
    const res = await request(createApp(router(), mount)).get(
      url(OTHER_PROJECT)
    );

    expect(res.status).toBe(404);
  });
});
