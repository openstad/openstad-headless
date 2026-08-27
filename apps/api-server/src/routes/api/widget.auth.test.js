import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

// The router is plain CommonJS and pulls in db + config at require time, so
// point node-config at the api-server config dir before importing anything.
process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');
const widgetRouter = require('./widget');

const PROJECT_ID = 1;
let updated = null;

// A real built instance, so can() runs through the real authorization mixin.
function targetWidget(type = 'resourceoverview') {
  const widget = db.Widget.build({
    id: 6,
    projectId: PROJECT_ID,
    type,
    description: 'Origineel',
    config: { rawInput: '<p>ok</p>' },
  });
  widget.update = async (values) => {
    updated = values;
    return { ...widget.dataValues, ...values };
  };
  return widget;
}

let widgetType = 'resourceoverview';

db.Widget.scope = () => ({
  // The collection route runs a list query before reaching the POST handler.
  findAndCountAll: async () => ({ rows: [], count: 0 }),
  findOne: async (query) =>
    // Mirror the real scoping: an id from another project must not resolve.
    Number(query.where.projectId) === PROJECT_ID
      ? targetWidget(widgetType)
      : null,
});

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: PROJECT_ID, config: {} };
    req.dbQuery = {};
    next();
  });
  app.use('/project/:projectId(\\d+)/widgets', widgetRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const anonymous = { role: 'anonymous', id: null };
const editor = { role: 'editor', id: 10 };

describe('PUT /project/:projectId/widgets/:id', () => {
  beforeEach(() => {
    updated = null;
    widgetType = 'resourceoverview';
  });

  it('refuses an unauthenticated update', async () => {
    const res = await request(createApp(anonymous))
      .put(`/project/${PROJECT_ID}/widgets/6`)
      .send({ description: 'POC' });

    expect(res.status).toBe(403);
    expect(updated).toBeNull();
  });

  it('refuses an editor from another project', async () => {
    const res = await request(createApp(editor))
      .put('/project/2/widgets/6')
      .send({ description: 'POC' });

    expect(res.status).toBe(404);
    expect(updated).toBeNull();
  });

  it('allows an editor of the owning project', async () => {
    const res = await request(createApp(editor))
      .put(`/project/${PROJECT_ID}/widgets/6`)
      .send({ description: 'Nieuw' });

    expect(res.status).toBe(200);
    expect(updated.description).toBe('Nieuw');
  });

  it('sanitizes incoming rawInput instead of the stored value', async () => {
    await request(createApp(editor))
      .put(`/project/${PROJECT_ID}/widgets/6`)
      .send({ config: { rawInput: '<script>alert(1)</script><p>hoi</p>' } });

    expect(updated.config.rawInput).not.toContain('<script>');
    expect(updated.config.rawInput).toContain('hoi');
  });
});

describe('DELETE /project/:projectId/widgets/:id', () => {
  it('refuses an unauthenticated delete', async () => {
    const res = await request(createApp(anonymous)).delete(
      `/project/${PROJECT_ID}/widgets/6`
    );

    expect(res.status).toBe(403);
  });
});

describe('POST /project/:projectId/widgets', () => {
  it('refuses an unauthenticated create', async () => {
    const res = await request(createApp(anonymous))
      .post(`/project/${PROJECT_ID}/widgets`)
      .send({ type: 'resourceoverview', description: 'POC' });

    expect(res.status).not.toBe(200);
    expect(res.body.error).toMatch(/cannot create/i);
  });
});
