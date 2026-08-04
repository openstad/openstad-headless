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
const authSettings = require('../../util/auth-settings');
const userRouter = require('./user');

// `canUpdate` drives the authorization outcome; the role matrix behind it is
// the User model's own concern and is exercised by the regular update route.
let canUpdate = false;
let found = true;

const updateUser = vi.fn(async () => ({}));
const fetchUserData = vi.fn(async () => ({ twoFactorConfigured: 1 }));

db.User.scope = () => ({
  findOne: async () =>
    found
      ? {
          id: 33,
          idpUser: { identifier: 'idp-33', provider: 'openstad' },
          can: () => canUpdate,
          toJSON: () => ({ id: 33 }),
        }
      : null,
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
const moderator = { role: 'moderator', id: 2 };

describe('two-factor routes require authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUpdate = false;
    found = true;
  });

  it('rejects an unauthenticated reset without touching the auth server', async () => {
    const res = await request(createApp(anonymous)).put(
      '/project/1/user/33/reset-two-factor'
    );

    expect(res.status).toBe(403);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated status read', async () => {
    const res = await request(createApp(anonymous)).get(
      '/project/1/user/33/two-factor-status'
    );

    expect(res.status).toBe(403);
    expect(fetchUserData).not.toHaveBeenCalled();
  });

  it('allows a reset for someone who may update the user', async () => {
    canUpdate = true;
    const res = await request(createApp(moderator)).put(
      '/project/1/user/33/reset-two-factor'
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

  it('allows a status read for someone who may update the user', async () => {
    canUpdate = true;
    const res = await request(createApp(moderator)).get(
      '/project/1/user/33/two-factor-status'
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ twoFactorEnabled: true });
  });

  it('404s on a missing user', async () => {
    canUpdate = true;
    found = false;
    const res = await request(createApp(moderator)).put(
      '/project/1/user/33/reset-two-factor'
    );

    expect(res.status).toBe(404);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('does not match a non-numeric userId', async () => {
    canUpdate = true;
    const res = await request(createApp(moderator)).put(
      '/project/1/user/33abc/reset-two-factor'
    );

    expect(res.status).not.toBe(200);
    expect(updateUser).not.toHaveBeenCalled();
  });
});
