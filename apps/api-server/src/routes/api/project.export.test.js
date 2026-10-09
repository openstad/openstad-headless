import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../db');

// The guard runs before the export query, so an unauthorized request never
// reaches the database and needs no fixtures.
let queried = false;
let lastQuery = null;
db.Project.scope = () => ({
  findOne: async (query) => {
    queried = true;
    lastQuery = query;
    return null;
  },
});

function createApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1, config: {} };
    req.dbQuery = {};
    next();
  });
  app.use('/project', require('./project'));
  app.use((err, req, res, next) => {
    res.status(err.status || 403).json({ error: err.message });
  });
  return app;
}

describe('GET /project/:projectId/export', () => {
  it('refuses an anonymous request', async () => {
    queried = false;
    const res = await request(createApp({ role: 'anonymous', id: null })).get(
      '/project/1/export'
    );

    expect(res.status).not.toBe(200);
    expect(queried).toBe(false);
  });

  it('refuses a plain member', async () => {
    const res = await request(createApp({ role: 'member', id: 4 })).get(
      '/project/1/export'
    );

    expect(res.status).not.toBe(200);
  });

  it('lets an editor through the guard', async () => {
    queried = false;
    await request(createApp({ role: 'editor', id: 10 })).get(
      '/project/1/export'
    );

    expect(queried).toBe(true);
  });

  it('loads votes and each comment sentiment in separate queries', async () => {
    lastQuery = null;
    await request(createApp({ role: 'editor', id: 10 })).get(
      '/project/1/export'
    );

    const resourceInclude = lastQuery.include.find(
      (include) => include.model === db.Resource
    );
    const byAlias = (as) =>
      resourceInclude.include.find((include) => include.as === as);

    expect(
      resourceInclude.include.find((include) => include.model === db.Vote)
    ).toMatchObject({ separate: true });
    expect(byAlias('commentsFor')).toMatchObject({
      separate: true,
      scope: false,
      where: { sentiment: 'for' },
      include: [{ model: db.User }],
    });
    expect(byAlias('commentsAgainst')).toMatchObject({
      separate: true,
      scope: false,
      where: { sentiment: 'against' },
      include: [{ model: db.User }],
    });
    expect(byAlias('commentsNoSentiment')).toMatchObject({
      separate: true,
      scope: false,
      where: { sentiment: 'no sentiment' },
      include: [{ model: db.User }],
    });
  });
});
