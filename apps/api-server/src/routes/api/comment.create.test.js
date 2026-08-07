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
const commentRouter = require('./comment');

const OWNER_ID = 7;
let created = null;

function createdComment() {
  return db.Comment.build({
    id: 42,
    resourceId: 5,
    userId: OWNER_ID,
    sentiment: 'no sentiment',
    description: 'Mijn nieuwe reactie',
  });
}

db.Comment.create = async (data) => {
  created = data;
  return createdComment();
};
db.Comment.scope = () => ({
  findByPk: async () => createdComment(),
});
db.Resource.scope = () => ({
  findByPk: async () => ({ projectId: 1, auth: { canComment: () => true } }),
});
db.Project.unscoped = () => ({
  findByPk: async () => null,
});

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1, config: {} };
    next();
  });
  app.use(
    '/project/:projectId(\\d+)/resource/:resourceId(\\d+)/comment',
    commentRouter
  );
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const owner = { role: 'member', id: OWNER_ID };
const url = '/project/1/resource/5/comment';

describe('POST create comment serializes the response for the requester', () => {
  beforeEach(() => {
    created = null;
  });

  it('returns can.edit to the author of the new comment', async () => {
    const res = await request(createApp(owner))
      .post(url)
      .send({ description: 'Mijn nieuwe reactie', sentiment: 'no sentiment' });

    expect(res.status).toBe(200);
    expect(res.body.can.edit).toBe(true);
  });

  it('omits the can flags for an unprivileged viewer (hardening intact)', () => {
    const json = createdComment().toJSON({ role: 'all' });
    expect(json.can.edit).toBeUndefined();
  });
});
