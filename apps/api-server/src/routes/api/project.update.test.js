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
const messageStreaming = require('../../services/message-streaming');
const projectRouter = require('./project');

const PROJECT_ID = 1;
let updated = null;

function buildProject() {
  const project = db.Project.build({
    id: PROJECT_ID,
    name: 'Test',
    url: 'example.com',
    config: { maps: { url: 'oud' } },
  });
  project.update = async (values) => {
    updated = values;
    return project;
  };
  return project;
}

db.Project.scope = () => ({
  findOne: async () => buildProject(),
  findByPk: async () => buildProject(),
  findAndCountAll: async () => ({ rows: [], count: 0 }),
});
db.Project.findOne = async () => buildProject();

// The publisher would reach out to redis; keep the update handler offline.
messageStreaming.getPublisher = async () => null;

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use('/project', projectRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const editor = { role: 'editor', id: 10 };
const url = `/project/${PROJECT_ID}`;

describe('PUT project', () => {
  beforeEach(() => {
    updated = null;
  });

  it('persists config changes for an editor', async () => {
    await request(createApp(editor))
      .put(url)
      .send({ config: { maps: { url: 'nieuw' } } });

    expect(updated?.config).toEqual({ maps: { url: 'nieuw' } });
  });

  it('still blanks admin-only fields for an editor', async () => {
    await request(createApp(editor))
      .put(url)
      .send({ auditIncidentAt: '2020-01-01T00:00:00.000Z' });

    expect(updated?.auditIncidentAt).toBeUndefined();
  });
});
