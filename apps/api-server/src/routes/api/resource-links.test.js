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
const resourceLinks = require('../../services/resource-links');
const resourceLinksRouter = require('./resource-links');

let calls = [];

db.Resource.findOne = async ({ where }) =>
  where.id === 5 && where.projectId === 1 ? { id: 5, projectId: 1 } : null;
resourceLinks.listLinks = async (args) => {
  calls.push(['list', args]);
  return [];
};
resourceLinks.createLink = async (args) => {
  calls.push(['create', args]);
  return { id: 7, ...args };
};
resourceLinks.removeLink = async (args) => {
  calls.push(['remove', args]);
};

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use(
    '/project/:projectId(\\d+)/resource/:resourceId(\\d+)/links',
    resourceLinksRouter
  );
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const editor = { role: 'editor', id: 1 };
const member = { role: 'member', id: 2 };
const anonymous = { role: 'anonymous', id: null };
const url = '/project/1/resource/5/links';

describe('resource links routes', () => {
  beforeEach(() => {
    calls = [];
  });

  it('lets anyone list links', async () => {
    const res = await request(createApp(anonymous)).get(url);
    expect(res.status).toBe(200);
    expect(calls).toEqual([
      ['list', { projectId: 1, resourceId: 5, user: anonymous }],
    ]);
  });

  it('returns 404 for an unknown resource', async () => {
    const res = await request(createApp(editor)).get(
      '/project/1/resource/6/links'
    );
    expect(res.status).toBe(404);
  });

  it('forbids members to create links', async () => {
    const res = await request(createApp(member))
      .post(url)
      .send({ targetSource: 'openstad', targetId: '8' });
    expect(res.status).toBe(403);
    expect(calls).toEqual([]);
  });

  it('lets editors create links', async () => {
    const res = await request(createApp(editor))
      .post(url)
      .send({ targetSource: 'openstad', targetId: '8' });
    expect(res.status).toBe(200);
    expect(calls).toEqual([
      [
        'create',
        {
          projectId: 1,
          resourceId: 5,
          targetSource: 'openstad',
          targetId: '8',
        },
      ],
    ]);
  });

  it('forbids members to remove links', async () => {
    const res = await request(createApp(member)).delete(`${url}/7`);
    expect(res.status).toBe(403);
  });

  it('lets editors remove links', async () => {
    const res = await request(createApp(editor)).delete(`${url}/7`);
    expect(res.status).toBe(200);
    expect(calls).toEqual([
      ['remove', { projectId: 1, resourceId: 5, linkId: 7 }],
    ]);
  });
});
