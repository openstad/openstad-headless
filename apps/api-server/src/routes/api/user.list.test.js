import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

// The router is plain CommonJS and pulls in db + config at require time, so
// point node-config at the api-server config dir before importing anything.
process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

// Load through CommonJS so the router and this test share one module cache.
const require = createRequire(import.meta.url);
const db = require('../../db');
const dbQuery = require('../../middleware/dbQuery');
const userRouter = require('./user');
const { Op } = require('sequelize');

let lastQuery = null;
let lastScope = null;

db.User.scope = (...scope) => {
  lastScope = scope;
  return {
    findAndCountAll: async (query) => {
      lastQuery = query;
      return { rows: [], count: 0 };
    },
  };
};

// routes/api/index.js mounts the dbQuery middleware ahead of this router.
function createApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1, config: {} };
    next();
  });
  app.use(dbQuery);
  app.use('/project/:projectId(\\d+)/user', userRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

function searchClauses() {
  const and = lastQuery && lastQuery.where && lastQuery.where[Op.and];
  return Array.isArray(and) ? and : [];
}

function listableRole() {
  const entry = (lastScope || []).find(
    (s) => s && Array.isArray(s.method) && s.method[0] === 'onlyListable'
  );
  return entry ? entry.method[2] : undefined;
}

const anonymous = { role: 'anonymous', id: null };
const member = { role: 'member', id: 7 };
const moderator = { role: 'moderator', id: 8 };
const admin = { role: 'admin', id: 1 };
const superuser = { role: 'superuser', id: 2 };

describe('the user list search filter is limited to privileged callers', () => {
  beforeEach(() => {
    lastQuery = null;
    lastScope = null;
  });

  it.each([
    ['a moderator', moderator],
    ['an admin', admin],
    ['a superuser', superuser],
  ])('applies the search filter for %s', async (label, user) => {
    const res = await request(createApp(user)).get('/project/1/user?q=a');

    expect(res.status).toBe(200);
    expect(searchClauses()).toHaveLength(1);
    expect(searchClauses()[0][Op.or]).toHaveLength(3);
  });

  it.each([
    ['a member', member],
    ['an anonymous visitor', anonymous],
  ])('ignores the search filter for %s', async (label, user) => {
    const res = await request(createApp(user)).get('/project/1/user?q=a');

    expect(res.status).toBe(200);
    expect(searchClauses()).toHaveLength(0);
  });

  it('never puts the search filter directly on Op.or', async () => {
    await request(createApp(moderator)).get('/project/1/user?q=a');

    expect(lastQuery.where[Op.or]).toBeUndefined();
  });

  it('leaves the query alone when no search term is given', async () => {
    await request(createApp(moderator)).get('/project/1/user');

    expect(searchClauses()).toHaveLength(0);
  });

  it('still applies the onlyListable scope for every caller', async () => {
    await request(createApp(anonymous)).get('/project/1/user?q=a');

    expect(listableRole()).toBe('anonymous');
  });

  it('maps superuser onto admin before scoping the list', async () => {
    await request(createApp(superuser)).get('/project/1/user?q=a');

    expect(listableRole()).toBe('admin');
  });
});
