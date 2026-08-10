import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
const can = require('../../lib/sequelize-authorization/mixins/can');
const authSettings = require('../../util/auth-settings');
const userRouter = require('./user');

let found = true;

const updateUser = vi.fn(async () => ({}));
const fetchUserData = vi.fn(async () => ({ twoFactorConfigured: 1 }));

// Stands in for the Sequelize instance the route looks up. It carries the real
// User.auth and the real can() mixin, so authorization is genuinely exercised
// rather than stubbed out.
function targetUser() {
  return {
    id: 93,
    role: 'admin',
    idpUser: { identifier: 'idp-93', provider: 'openstad' },
    auth: Object.create(db.User.auth),
    can,
    toString: () => 'SequelizeInstance:user',
    toJSON: () => ({ id: 93 }),
  };
}

db.User.scope = () => ({
  findOne: async () => (found ? targetUser() : null),
});

authSettings.config = async () => ({});
authSettings.adapter = async () => ({ service: { updateUser, fetchUserData } });

function createApp(user) {
  const app = express();
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

const anonymous = { role: 'anonymous', id: null };
const member = { role: 'member', id: 7 };
const moderator = { role: 'moderator', id: 8 };
const admin = { role: 'admin', id: 1 };
const self = { role: 'admin', id: 93 };

describe('two-factor routes require authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    found = true;
  });

  // The target is an admin, so a moderator must not reach it either: you cannot
  // act on a user with more rights than you have.
  const denied = [
    ['anonymous', anonymous],
    ['a member', member],
    ['a moderator', moderator],
  ];

  for (const [label, user] of denied) {
    it(`rejects a reset by ${label} without touching the auth server`, async () => {
      const res = await request(createApp(user)).put(
        '/project/1/user/93/reset-two-factor'
      );

      expect(res.status).toBe(403);
      expect(updateUser).not.toHaveBeenCalled();
    });

    it(`rejects a status read by ${label}`, async () => {
      const res = await request(createApp(user)).get(
        '/project/1/user/93/two-factor-status'
      );

      expect(res.status).toBe(403);
      expect(fetchUserData).not.toHaveBeenCalled();
    });
  }

  it('allows an admin to reset', async () => {
    const res = await request(createApp(admin)).put(
      '/project/1/user/93/reset-two-factor'
    );

    expect(res.status).toBe(200);
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userData: expect.objectContaining({
          twoFactorToken: null,
          twoFactorConfigured: null,
        }),
      })
    );
  });

  it('allows the user themselves to reset', async () => {
    const res = await request(createApp(self)).put(
      '/project/1/user/93/reset-two-factor'
    );

    expect(res.status).toBe(200);
    expect(updateUser).toHaveBeenCalled();
  });

  it('allows an admin to read the status', async () => {
    const res = await request(createApp(admin)).get(
      '/project/1/user/93/two-factor-status'
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ twoFactorEnabled: true });
  });

  it('404s on a missing user', async () => {
    found = false;
    const res = await request(createApp(admin)).put(
      '/project/1/user/93/reset-two-factor'
    );

    expect(res.status).toBe(404);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('does not match a non-numeric userId', async () => {
    const res = await request(createApp(admin)).put(
      '/project/1/user/93abc/reset-two-factor'
    );

    expect(res.status).not.toBe(200);
    expect(updateUser).not.toHaveBeenCalled();
  });
});
