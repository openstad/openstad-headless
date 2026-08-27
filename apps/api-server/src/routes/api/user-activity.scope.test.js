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
const activityRouter = require('./user-activity');

const PROJECT_ID = 1;
const TARGET_USER = 9012;

let userWhere = null;
let crossProjectLookup = false;

db.User.findOne = async (query) => {
  userWhere = query.where;
  return db.User.build({
    id: TARGET_USER,
    projectId: PROJECT_ID,
    idpUser: { identifier: 'abc', provider: 'openstad' },
  });
};

db.User.scope = () => ({
  findAll: async () => {
    crossProjectLookup = true;
    return [];
  },
});

const emptyFinder = () => ({ findAll: async () => [] });
db.Resource.scope = emptyFinder;
db.Comment.scope = emptyFinder;
db.Vote.scope = emptyFinder;
db.Project.findAll = async () => [];

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: PROJECT_ID, config: {} };
    req.dbQuery = {};
    next();
  });
  app.use(
    '/project/:projectId(\\d+)/user/:userId(\\d+)/activity',
    activityRouter
  );
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const url = `/project/${PROJECT_ID}/user/${TARGET_USER}/activity?includeOtherProjects=1`;

describe('user activity scoping', () => {
  beforeEach(() => {
    userWhere = null;
    crossProjectLookup = false;
  });

  it('does not let a project admin reach other projects', async () => {
    await request(createApp({ role: 'admin', id: 1 })).get(url);

    expect(crossProjectLookup).toBe(false);
  });

  it('still allows a superuser to cross projects', async () => {
    await request(createApp({ role: 'superuser', id: 1 })).get(url);

    expect(crossProjectLookup).toBe(true);
  });

  it('scopes the user lookup to the project in the url', async () => {
    await request(createApp({ role: 'superuser', id: 1 })).get(url);

    expect(userWhere).toMatchObject({ projectId: String(PROJECT_ID) });
  });
});
