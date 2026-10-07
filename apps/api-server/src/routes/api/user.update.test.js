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
const { Op } = require('sequelize');
const db = require('../../db');
const authSettings = require('../../util/auth-settings');
const userRouter = require('./user');

const idpUser = { identifier: 'idp-93', provider: 'openstad' };

// Real User instances, so the real can() and authorizeData() mixins run.
function userRow(id, projectId, role) {
  const row = db.User.build({ id, projectId, role, idpUser, name: 'Old' });
  row.update = vi.fn(async () => row);
  return row;
}

let rows;
const updateUser = vi.fn(async ({ userData }) => ({ ...userData, idpUser }));

db.User.scope = () => ({
  findOne: async ({ where }) =>
    rows.find((r) => r.id == where.id && r.projectId == where.projectId) ||
    null,
  // anonymize asks for the other records via `[Op.not]: { id }`
  findAll: async ({ where }) => rows.filter((r) => r.id != where[Op.not]?.id),
});
db.User.findAll = async () => rows;
db.User.findOne = async ({ where }) =>
  rows.find((r) => r.id == where.id && r.projectId == where.projectId) || null;
db.Project.findAll = async () => [{ id: 1 }, { id: 2 }];

authSettings.config = async () => ({ provider: 'openstad' });
authSettings.adapter = async () => ({ service: { updateUser } });

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

const moderator = { role: 'moderator', id: 8, projectId: 1 };
const admin = { role: 'admin', id: 9, projectId: 1 };
const superuser = { role: 'superuser', id: 1, projectId: 1 };

const identityBody = {
  name: 'New',
  email: 'attacker@example.com',
  password: 'secret',
  twoFactorToken: 'known-seed',
  twoFactorConfigured: 1,
  role: 'moderator',
};

const sentUserData = () => updateUser.mock.calls[0][0].userData;

describe('PUT /user/:userId identity fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('target is a member here but an admin in another project', () => {
    beforeEach(() => {
      rows = [userRow(93, 1, 'member'), userRow(193, 2, 'admin')];
    });

    it('does not send password, email or 2FA to the auth server for a moderator', async () => {
      const res = await request(createApp(moderator))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(res.status).toBe(200);
      const data = sentUserData();
      expect(data.name).toBe('New');
      expect(data.password).toBeUndefined();
      expect(data.email).toBeUndefined();
      expect(data.twoFactorToken).toBeUndefined();
      expect(data.twoFactorConfigured).toBeUndefined();
      expect(data.role).toBeUndefined();
    });

    it('does not let a project admin change the shared identity either', async () => {
      await request(createApp(admin))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(sentUserData().email).toBeUndefined();
      expect(sentUserData().password).toBeUndefined();
    });

    it('does not touch the record in the other project', async () => {
      await request(createApp(admin))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(rows[1].update).not.toHaveBeenCalled();
    });

    it('lets a superuser change the shared identity', async () => {
      await request(createApp(superuser))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(sentUserData().email).toBe('attacker@example.com');
      expect(sentUserData().password).toBe('secret');
      expect(sentUserData().twoFactorToken).toBeUndefined();
    });

    it('rejects anonymize-all by a project admin before anonymizing anything', async () => {
      for (const row of rows) row.doAnonymize = vi.fn(async () => ({}));

      const res = await request(createApp(admin)).put(
        '/project/1/user/93/do-anonymizeall'
      );

      expect(res.status).toBe(403);
      expect(rows[0].doAnonymize).not.toHaveBeenCalled();
      expect(rows[1].doAnonymize).not.toHaveBeenCalled();
    });

    it('rejects a 2FA reset by a project admin without touching the auth server', async () => {
      const res = await request(createApp(admin)).put(
        '/project/1/user/93/reset-two-factor'
      );

      expect(res.status).toBe(403);
      expect(updateUser).not.toHaveBeenCalled();
    });
  });

  describe('target only exists in this project', () => {
    beforeEach(() => {
      rows = [userRow(93, 1, 'member')];
    });

    it('lets a project admin change email and password', async () => {
      await request(createApp(admin))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(sentUserData().email).toBe('attacker@example.com');
      expect(sentUserData().password).toBe('secret');
      expect(sentUserData().role).toBe('moderator');
    });

    it('does not let a moderator change email or promote', async () => {
      await request(createApp(moderator))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(sentUserData().email).toBeUndefined();
      expect(sentUserData().role).toBeUndefined();
    });

    it('lets the person edit their own profile (account widget)', async () => {
      const owner = { role: 'member', id: 93, projectId: 1, idpUser };
      const res = await request(createApp(owner))
        .put('/project/1/user/93')
        .send({ name: 'New', address: 'Straat 1', city: 'Utrecht' });

      expect(res.status).toBe(200);
      expect(sentUserData()).toMatchObject({
        name: 'New',
        address: 'Straat 1',
        city: 'Utrecht',
      });
      expect(rows[0].update).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New', city: 'Utrecht' })
      );
    });

    it('lets a project admin reset 2FA', async () => {
      const res = await request(createApp(admin)).put(
        '/project/1/user/93/reset-two-factor'
      );

      expect(res.status).toBe(200);
      expect(updateUser).toHaveBeenCalled();
    });
  });
});
