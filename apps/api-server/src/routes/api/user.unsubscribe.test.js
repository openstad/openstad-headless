import express from 'express';
import crypto from 'node:crypto';
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
const userRouter = require('./user');

const USER_ID = 42;
const PROJECT_ID = 1;
let saved = false;

db.User.findOne = async () => ({
  id: USER_ID,
  projectId: PROJECT_ID,
  emailNotificationConsent: true,
  save: async () => {
    saved = true;
    throw new Error('stop after save');
  },
});

const hashWith = (salt) =>
  crypto
    .createHash('md5')
    .update(`${salt}.${USER_ID}.${PROJECT_ID}`)
    .digest('hex');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { role: 'anonymous', id: null };
    req.project = { id: PROJECT_ID, config: {} };
    req.dbQuery = {};
    next();
  });
  app.use('/user', userRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const originalSalt = process.env.USER_ID_SALT;

describe('unsubscribe link', () => {
  beforeEach(() => {
    saved = false;
  });

  afterEach(() => {
    if (originalSalt === undefined) delete process.env.USER_ID_SALT;
    else process.env.USER_ID_SALT = originalSalt;
  });

  it('refuses when no salt is configured', async () => {
    delete process.env.USER_ID_SALT;

    const res = await request(createApp()).get(
      `/user/unsubscribe/${USER_ID}/${hashWith(undefined)}`
    );

    expect(saved).toBe(false);
    expect(res.body.error).toMatch(/not configured/i);
  });

  it('refuses a hash that does not match', async () => {
    process.env.USER_ID_SALT = 'echte-salt';

    const res = await request(createApp()).get(
      `/user/unsubscribe/${USER_ID}/${hashWith('verkeerde-salt')}`
    );

    expect(saved).toBe(false);
    expect(res.body.error).toMatch(/invalid unsubscribe link/i);
  });

  it('accepts the correctly salted hash', async () => {
    process.env.USER_ID_SALT = 'echte-salt';

    await request(createApp()).get(
      `/user/unsubscribe/${USER_ID}/${hashWith('echte-salt')}`
    );

    expect(saved).toBe(true);
  });
});
