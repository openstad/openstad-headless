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
  const row = db.User.build({
    id,
    projectId,
    role,
    idpUser,
    name: 'Old',
    email: 'old@example.com',
  });
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
// Only the admin project lookup goes through findByPk here.
db.Project.findByPk = async (id) => ({ id, config: {}, isAdminProject: true });

// The admin project's auth config carries the admin client credentials.
authSettings.config = async ({ project }) => ({
  provider: 'openstad',
  clientId: project?.isAdminProject ? 'admin-client' : 'project-client',
});
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
  email: 'new@example.com',
  password: 'secret',
  twoFactorToken: 'known-seed',
  twoFactorConfigured: 1,
  role: 'moderator',
};

const sentWith = (clientId) =>
  updateUser.mock.calls
    .filter(([args]) => args.authConfig.clientId === clientId)
    .map(([args]) => args.userData);

describe('PUT /user/:userId identity fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('target is a member here but an admin in another project', () => {
    beforeEach(() => {
      rows = [userRow(93, 1, 'member'), userRow(193, 2, 'admin')];
    });

    for (const [label, user] of [
      ['a moderator', moderator],
      ['a project admin', admin],
    ]) {
      it(`rejects an email or password change by ${label} without writing anything`, async () => {
        const res = await request(createApp(user))
          .put('/project/1/user/93')
          .send(identityBody);

        expect(res.status).toBe(403);
        expect(updateUser).not.toHaveBeenCalled();
        expect(rows[0].update).not.toHaveBeenCalled();
      });
    }

    it('rejects a name or phone number change by a project admin', async () => {
      for (const body of [{ name: 'New' }, { phoneNumber: '0612345678' }]) {
        const res = await request(createApp(admin))
          .put('/project/1/user/93')
          .send(body);

        expect(res.status).toBe(403);
      }
      expect(updateUser).not.toHaveBeenCalled();
    });

    it('accepts unchanged identity fields and an empty password from the admin form', async () => {
      const res = await request(createApp(admin))
        .put('/project/1/user/93')
        .send({
          name: 'Old',
          email: 'old@example.com',
          password: '',
          address: 'Straat 1',
        });

      expect(res.status).toBe(200);
      expect(sentWith('admin-client')).toEqual([]);
      const [data] = sentWith('project-client');
      expect(data.address).toBe('Straat 1');
      expect(data.name).toBeUndefined();
      expect(data.email).toBeUndefined();
      expect(data.password).toBeUndefined();
    });

    it('does not touch the record in the other project', async () => {
      await request(createApp(admin))
        .put('/project/1/user/93')
        .send({ address: 'Straat 1' });

      expect(rows[1].update).not.toHaveBeenCalled();
    });

    it('lets a superuser change the shared identity through the admin client', async () => {
      const res = await request(createApp(superuser))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(res.status).toBe(200);
      expect(sentWith('admin-client')).toEqual([
        expect.objectContaining({
          name: 'New',
          email: 'new@example.com',
          password: 'secret',
        }),
      ]);
      expect(sentWith('admin-client')[0].role).toBeUndefined();

      const [projectData] = sentWith('project-client');
      expect(projectData.name).toBeUndefined();
      expect(projectData.role).toBe('moderator');
      expect(projectData.email).toBeUndefined();
      expect(projectData.password).toBeUndefined();
      expect(projectData.twoFactorToken).toBeUndefined();
    });

    it('does not treat a user of another auth provider with the same identifier as the same person', async () => {
      const lookalike = {
        role: 'member',
        id: 500,
        projectId: 1,
        idpUser: { identifier: 'idp-93', provider: 'oidc' },
      };
      const res = await request(createApp(lookalike))
        .put('/project/1/user/93')
        .send({ email: 'new@example.com' });

      expect(res.status).not.toBe(200);
      expect(sentWith('admin-client')).toEqual([]);
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

    it('lets a superuser reset 2FA through the admin client', async () => {
      const res = await request(createApp(superuser)).put(
        '/project/1/user/93/reset-two-factor'
      );

      expect(res.status).toBe(200);
      expect(sentWith('admin-client')).toEqual([
        expect.objectContaining({
          twoFactorToken: null,
          twoFactorConfigured: null,
        }),
      ]);
      expect(sentWith('project-client')).toEqual([]);
    });
  });

  describe('target only exists in this project', () => {
    beforeEach(() => {
      rows = [userRow(93, 1, 'member')];
    });

    // Only superusers use the admin client: the auth server must still check
    // that the identity has no roles on other clients (which the api cannot see).
    it('lets a project admin change email and password through the project client', async () => {
      const res = await request(createApp(admin))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(res.status).toBe(200);
      expect(sentWith('admin-client')).toEqual([]);
      // identity first, so a refusal by the auth server leaves nothing half saved
      expect(sentWith('project-client')).toEqual([
        expect.objectContaining({
          name: 'New',
          email: 'new@example.com',
          password: 'secret',
        }),
        expect.objectContaining({ role: 'moderator' }),
      ]);
    });

    it('returns 403 and saves nothing when the auth server refuses the identity change', async () => {
      updateUser.mockImplementationOnce(async () => {
        const err = new Error('Fetch failed');
        err.status = 403;
        throw err;
      });

      const res = await request(createApp(admin))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(res.status).toBe(403);
      expect(updateUser).toHaveBeenCalledTimes(1);
      expect(rows[0].update).not.toHaveBeenCalled();
    });

    it('does not let a moderator change email, password or promote', async () => {
      await request(createApp(moderator))
        .put('/project/1/user/93')
        .send(identityBody);

      expect(sentWith('admin-client')).toEqual([]);
      const [data] = sentWith('project-client');
      expect(data.email).toBeUndefined();
      expect(data.password).toBeUndefined();
      expect(data.role).toBeUndefined();
    });

    it('lets the person edit their own profile (account widget)', async () => {
      const owner = { role: 'member', id: 93, projectId: 1, idpUser };
      const res = await request(createApp(owner))
        .put('/project/1/user/93')
        .send({ name: 'New', address: 'Straat 1', city: 'Utrecht' });

      expect(res.status).toBe(200);
      // the person themselves may write their identity through the admin client
      expect(sentWith('admin-client')).toEqual([
        expect.objectContaining({ name: 'New' }),
      ]);
      expect(sentWith('project-client')[0]).toMatchObject({
        address: 'Straat 1',
        city: 'Utrecht',
      });
      expect(rows[0].update).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New', city: 'Utrecht' })
      );
    });

    it('lets a project admin reset 2FA through the project client', async () => {
      const res = await request(createApp(admin)).put(
        '/project/1/user/93/reset-two-factor'
      );

      expect(res.status).toBe(200);
      expect(sentWith('admin-client')).toEqual([]);
      expect(sentWith('project-client')).toHaveLength(1);
    });
  });

  describe('a linked record fails to update', () => {
    beforeEach(() => {
      rows = [userRow(93, 1, 'member'), userRow(193, 2, 'member')];
      rows[1].update = vi.fn(async () => {
        throw new Error('db down');
      });
    });

    it('still reports success for the records that were saved', async () => {
      const res = await request(createApp(superuser))
        .put('/project/1/user/93')
        .send({ name: 'New' });

      expect(res.status).toBe(200);
      expect(rows[0].update).toHaveBeenCalled();
    });
  });
});
