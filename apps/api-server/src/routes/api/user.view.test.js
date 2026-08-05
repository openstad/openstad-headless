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
const userRouter = require('./user');

let found = true;
let lastQuery = null;

// A real built instance: serialization runs through the real toAuthorizedJSON
// mixin with the real field-level auth config.
function targetUser() {
  return db.User.build({
    id: 2,
    projectId: 1,
    role: 'member',
    name: 'Doelwit Persoon',
    email: 'doelwit@example.com',
  });
}

db.User.scope = () => ({
  findOne: async (query) => {
    lastQuery = query;
    return found ? targetUser() : null;
  },
});

function createApp(user, { withProject = true } = {}) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    if (withProject) req.project = { id: 1, config: {} };
    next();
  });
  if (withProject) {
    app.use('/project/:projectId(\\d+)/user', userRouter);
  } else {
    app.use('/user', userRouter);
  }
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const anonymous = { role: 'anonymous', id: null };
const member = { role: 'member', id: 7 };
const moderator = { role: 'moderator', id: 8 };
const admin = { role: 'admin', id: 1 };
const owner = { role: 'member', id: 2 };

describe('GET single user requires authorization and project scoping', () => {
  beforeEach(() => {
    found = true;
    lastQuery = null;
  });

  it('rejects an anonymous request', async () => {
    const res = await request(createApp(anonymous)).get('/project/1/user/2');
    expect(res.status).toBe(403);
  });

  it('rejects a member requesting someone else', async () => {
    const res = await request(createApp(member)).get('/project/1/user/2');
    expect(res.status).toBe(403);
  });

  it('allows a moderator and returns the displayName', async () => {
    const res = await request(createApp(moderator)).get('/project/1/user/2');
    expect(res.status).toBe(200);
    expect(res.body.displayName).toBe('Doelwit Persoon');
  });

  it('allows an admin and returns name and email', async () => {
    const res = await request(createApp(admin)).get('/project/1/user/2');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Doelwit Persoon');
    expect(res.body.email).toBe('doelwit@example.com');
  });

  it('allows the user themselves', async () => {
    const res = await request(createApp(owner)).get('/project/1/user/2');
    expect(res.status).toBe(200);
  });

  it('scopes the lookup to the project so cross-project reads 404', async () => {
    found = false;
    const res = await request(createApp(admin)).get('/project/3/user/2');
    expect(res.status).toBe(404);
    expect(lastQuery.where).toMatchObject({ id: 2, projectId: '3' });
  });

  it('keeps the bare admin mount cross-project', async () => {
    const res = await request(createApp(admin, { withProject: false })).get(
      '/user/2'
    );
    expect(res.status).toBe(200);
    expect(lastQuery.where).not.toHaveProperty('projectId');
  });
});

describe('embedded user serialization is untouched (regression)', () => {
  it('still exposes displayName, id and a role string to anonymous viewers', () => {
    const embedded = targetUser();
    embedded.auth = Object.create(db.User.auth);
    embedded.auth.user = { role: 'all' };
    const json = embedded.toJSON();
    expect(json.id).toBe(2);
    expect(json.displayName).toBe('Doelwit Persoon');
    expect(typeof json.role).toBe('string');
  });
});
