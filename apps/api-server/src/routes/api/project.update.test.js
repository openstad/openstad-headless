import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const messageStreaming = require('../../services/message-streaming');
const openstadAuthService = require('../../adapter/openstad/service');
const projectRouter = require('./project');

const PROJECT_ID = 1;
let updated = null;
let storedConfig = null;

function buildProject() {
  const project = db.Project.build({
    id: PROJECT_ID,
    name: 'Test',
    url: 'example.com',
    config: storedConfig,
  });
  project.update = async (values) => {
    updated = values;
    if (values.config) {
      project.set('config', values.config);
      storedConfig = project.getDataValue('config');
    }
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
const admin = { role: 'admin', id: 1 };
const url = `/project/${PROJECT_ID}`;

describe('PUT project', () => {
  beforeEach(() => {
    updated = null;
    storedConfig = { maps: { url: 'oud' } };
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

describe('PUT project syncs canCreateNewUsers to the auth client', () => {
  let updateClient;

  function storeCanCreateNewUsers(canCreateNewUsers) {
    storedConfig = {
      users: { canCreateNewUsers },
      auth: {
        provider: {
          openstad: {
            adapter: 'openstad',
            clientId: 'client',
            clientSecret: 's',
          },
        },
      },
    };
  }

  function syncedValues() {
    return updateClient.mock.calls
      .filter(([{ authConfig }]) => authConfig.provider === 'openstad')
      .map(([{ project }]) => project.config.users.canCreateNewUsers);
  }

  beforeEach(() => {
    updated = null;
    updateClient = vi
      .spyOn(openstadAuthService, 'updateClient')
      .mockResolvedValue(undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('syncs the setting when it is switched on', async () => {
    storeCanCreateNewUsers(false);

    const res = await request(createApp(admin))
      .put(url)
      .send({ config: { users: { canCreateNewUsers: true } } });

    expect(res.status).toBe(200);
    expect(syncedValues()).toEqual([true]);
  });

  it('syncs the setting when it is switched off', async () => {
    storeCanCreateNewUsers(true);

    await request(createApp(admin))
      .put(url)
      .send({ config: { users: { canCreateNewUsers: false } } });

    expect(syncedValues()).toEqual([false]);
  });

  it('syncs the setting when it is saved unchanged, so a stale auth client is repaired', async () => {
    storeCanCreateNewUsers(true);

    await request(createApp(admin))
      .put(url)
      .send({ config: { users: { canCreateNewUsers: true } } });

    expect(syncedValues()).toEqual([true]);
  });

  it('leaves the auth client alone when the setting is not touched', async () => {
    storeCanCreateNewUsers(false);

    await request(createApp(admin))
      .put(url)
      .send({ config: { maps: { url: 'nieuw' } } });

    expect(updateClient).not.toHaveBeenCalled();
  });
});
