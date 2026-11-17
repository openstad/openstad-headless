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
const STORED_EMAIL_CONFIG = {
  notifications: { fromAddress: 'keep@example.com' },
  styling: { logo: 'https://example.com/old-logo.png' },
};

let savedEmailConfig = null;

function loadProject({ withEmailConfig }) {
  const values = {
    id: PROJECT_ID,
    name: 'Test',
    url: 'example.com',
    config: {},
  };
  if (withEmailConfig) values.emailConfig = STORED_EMAIL_CONFIG;
  const project = db.Project.build(values, { isNewRecord: false });
  project.update = async (body) => {
    project.set(body);
    savedEmailConfig = project.emailConfig;
    return project;
  };
  return project;
}

db.Project.findOne = async () => loadProject({ withEmailConfig: false });
db.Project.scope = (...scopes) => ({
  findOne: async () =>
    loadProject({ withEmailConfig: scopes.includes('includeEmailConfig') }),
  findByPk: async () => loadProject({ withEmailConfig: false }),
  findAndCountAll: async () => ({ rows: [], count: 0 }),
});

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

const admin = { role: 'admin', id: 10 };

describe('PUT project emailConfig', () => {
  beforeEach(() => {
    savedEmailConfig = null;
  });

  it('keeps the other email settings when only one section is saved', async () => {
    await request(createApp(admin))
      .put(`/project/${PROJECT_ID}`)
      .send({
        emailConfig: { styling: { logo: 'https://example.com/new-logo.png' } },
      });

    expect(savedEmailConfig.notifications.fromAddress).toBe('keep@example.com');
    expect(savedEmailConfig.styling.logo).toBe(
      'https://example.com/new-logo.png'
    );
  });
});
