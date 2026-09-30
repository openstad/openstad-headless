import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use createRequire so we get the same CJS module.exports reference as the
// router does; patching the shared auth and db objects is how the other
// api-server suites (e.g. routes/api/api-token.test.js) avoid a real database.
const require = createRequire(import.meta.url);
const auth = require('../../middleware/sequelize-authorization-middleware');
const db = require('../../db');

const originalCan = auth.can;
const originalUseReqUser = auth.useReqUser;
const passThrough = (req, res, next) => next();

// The router calls auth.can()/auth.useReqUser at require time, so both have to
// be neutralised before the module is loaded.
auth.can = () => passThrough;
auth.useReqUser = passThrough;
const tagRouter = require('./tag');

const PROJECT_ID = 2;
const BASE_URL = `/project/${PROJECT_ID}/tag`;

const originalTagMax = db.Tag.max;
const originalTagCreate = db.Tag.create;
const originalTagAuthorizeData = db.Tag.authorizeData;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  });
  app.use('/project/:projectId/tag', tagRouter);
  // Mirror the api-server error handler: http-errors carry their own status.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
}

beforeEach(() => {
  db.Tag.max = vi.fn().mockResolvedValue(30);
  // Echo back what the route built, the way Sequelize#create would.
  db.Tag.create = vi.fn().mockImplementation(async (values) => ({
    id: 7,
    ...values,
  }));
  db.Tag.authorizeData = vi.fn().mockReturnValue(db.Tag);
});

afterEach(() => {
  db.Tag.max = originalTagMax;
  db.Tag.create = originalTagCreate;
  db.Tag.authorizeData = originalTagAuthorizeData;
  auth.can = originalCan;
  auth.useReqUser = originalUseReqUser;
  vi.restoreAllMocks();
});

describe('POST /project/:projectId/tag', () => {
  it('places a tag without a seqnr one step past the group max', async () => {
    const response = await request(createApp())
      .post(BASE_URL)
      .send({ name: 'Verkeer', type: 'theme', seqnr: '' });

    expect(response.status).toBe(200);
    expect(db.Tag.max).toHaveBeenCalledWith('seqnr', {
      where: { type: 'theme' },
    });
    expect(response.body.seqnr).toBe(40);
  });

  it('keeps an explicitly provided seqnr and skips the group lookup', async () => {
    const response = await request(createApp())
      .post(BASE_URL)
      .send({ name: 'Verkeer', type: 'theme', seqnr: 15 });

    expect(response.status).toBe(200);
    expect(db.Tag.max).not.toHaveBeenCalled();
    expect(response.body.seqnr).toBe(15);
  });

  it('looks the group max up by the normalized type, as it is stored', async () => {
    await request(createApp())
      .post(BASE_URL)
      .send({ name: 'Verkeer', type: ' thème ' });

    expect(db.Tag.max).toHaveBeenCalledWith('seqnr', {
      where: { type: 'theme' },
    });
  });

  it('rejects a non-string name instead of crashing in the model setter', async () => {
    const response = await request(createApp())
      .post(BASE_URL)
      .send({ name: 42, type: 'theme' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Tag name must be a string');
    expect(db.Tag.create).not.toHaveBeenCalled();
  });

  it('rejects a non-string type instead of coercing it into a tag group', async () => {
    const response = await request(createApp())
      .post(BASE_URL)
      .send({ name: 'Verkeer', type: ['a', 'b'] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Tag type must be a string');
    expect(db.Tag.create).not.toHaveBeenCalled();
  });
});
