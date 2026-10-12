import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const can = require('../../lib/sequelize-authorization/mixins/can');
const authSettings = require('../../util/auth-settings');
const userRouter = require('./user');

let deleteAttempted;

function targetUser() {
  return {
    id: 93,
    projectId: 1,
    role: 'member',
    idpUser: { identifier: 'idp-93', provider: 'openstad' },
    auth: Object.create(db.User.auth),
    can,
    destroy: async () => ({}),
    doAnonymize: async () => ({ user: { id: 93 }, project: { id: 1 } }),
    toString: () => 'SequelizeInstance:user',
    toJSON: () => ({ id: 93 }),
  };
}

db.User.scope = () => ({
  findOne: async () => targetUser(),
  findAll: async () => [],
});
db.User.findAll = async () => [targetUser()];
db.Resource.destroy = async () => 0;
db.Comment.destroy = async () => 0;
db.Vote.destroy = async () => 0;

authSettings.config = async () => ({ clientId: 'client' });
authSettings.adapter = async () => ({
  service: {
    deleteUser: () => {
      deleteAttempted = true;
      return Promise.reject(new Error('Cannot connect to auth server'));
    },
  },
});

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1, config: {} };
    next();
  });
  app.use('/project/:projectId(\\d+)/user', userRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const admin = { role: 'admin', id: 1 };

describe('removing a user when the auth server refuses the delete', () => {
  let unhandled;
  const onUnhandled = (reason) => unhandled.push(reason);

  beforeEach(() => {
    deleteAttempted = false;
    unhandled = [];
    process.on('unhandledRejection', onUnhandled);
  });

  afterEach(() => {
    process.off('unhandledRejection', onUnhandled);
  });

  const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

  it('keeps running when a user is deleted', async () => {
    const res = await request(createApp(admin)).delete('/project/1/user/93');
    await settle();

    expect(res.status).toBe(200);
    expect(deleteAttempted).toBe(true);
    expect(unhandled).toEqual([]);
  });

  it('keeps running when a user is anonymized', async () => {
    const res = await request(createApp(admin)).put(
      '/project/1/user/93/do-anonymize'
    );
    await settle();

    expect(res.status).toBe(200);
    expect(deleteAttempted).toBe(true);
    expect(unhandled).toEqual([]);
  });
});
