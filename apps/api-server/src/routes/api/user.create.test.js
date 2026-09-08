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
const authSettings = require('../../util/auth-settings');
const userRouter = require('./user');

let created = null;

const oAuthIdentity = { identifier: 'idp-abc', provider: 'openstad' };

function createdUser() {
  return db.User.build({
    id: 99,
    projectId: 1,
    role: 'member',
    name: 'Nieuwe Persoon',
    email: 'nieuw@example.com',
    idpUser: oAuthIdentity,
  });
}

authSettings.config = async () => ({ provider: 'openstad' });
authSettings.adapter = async () => ({ service: {} });

db.User.scope = () => ({
  findOne: async () => null,
});
db.User.create = async (data) => {
  created = data;
  return createdUser();
};

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1, config: { users: { canCreateNewUsers: true } } };
    req.oAuthUser = { idpUser: oAuthIdentity, role: 'member' };
    next();
  });
  app.use('/project/:projectId(\\d+)/user', userRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const admin = { role: 'admin', id: 1 };
const url = '/project/1/user';

describe('POST create user serializes the response for the requester', () => {
  beforeEach(() => {
    created = null;
  });

  it('returns idpUser to the admin that created the user', async () => {
    const res = await request(createApp(admin))
      .post(url)
      .send({ email: 'nieuw@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.idpUser).toEqual(oAuthIdentity);
  });

  it('still strips idpUser for an unprivileged viewer (hardening intact)', () => {
    const json = createdUser().toJSON({ role: 'all' });
    expect(json.id).toBe(99);
    expect(json.idpUser).toBeUndefined();
  });
});
