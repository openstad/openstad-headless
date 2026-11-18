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
const { Op } = require('sequelize');
const db = require('../../db');
const pluginExtensions = require('../../services/plugin-extensions');
const linkOptionsRouter = require('./link-options');

let scopes = [];
let queries = [];

db.Resource.scope = (...args) => {
  scopes = args;
  return {
    findAll: async (query) => {
      queries.push(query);
      return [
        {
          id: 2,
          userId: 10,
          title: 'Stadmaker',
          images: [{ url: 'https://img/2' }],
          ...(args.includes('includeTags') ? { tags: [{ id: 8 }] } : {}),
        },
        { id: 3, userId: 11, title: 'Zonder foto', images: [] },
      ];
    },
  };
};

const fixtureSource = {
  search: vi.fn(async () => [{ id: 'a1', label: 'Fixture item' }]),
  get: vi.fn(async ({ ids }) => ids.map((id) => ({ id, label: id }))),
};

function createApp(user = { role: 'anonymous', id: null }) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    req.project = { id: 1 };
    next();
  });
  app.use('/project/:projectId(\\d+)/link-options', linkOptionsRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('link options', () => {
  beforeEach(() => {
    scopes = [];
    queries = [];
    vi.spyOn(pluginExtensions, 'get').mockReturnValue({
      getSource: (key) => (key === 'fixture-source' ? fixtureSource : null),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires a search of at least two characters', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/openstad?search=a'
    );
    expect(res.status).toBe(422);
  });

  it('lists the first ten resources without a search', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/openstad?tags=3'
    );

    expect(res.status).toBe(200);
    expect(queries[0].limit).toBe(10);
    expect(queries[0].order).toEqual([['title', 'ASC']]);
    expect(queries[0].where[Op.and]).toEqual([]);
  });

  it('keeps the minimum search length for plugin sources', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/fixture-source'
    );
    expect(res.status).toBe(422);
  });

  it('searches visible published resources by every word', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/openstad?search=Stad%20ma_ker&exclude=5'
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: '2', label: 'Stadmaker', image: 'https://img/2' },
      { id: '3', label: 'Zonder foto' },
    ]);
    expect(scopes).toEqual([{ method: ['onlyVisible', null, 'anonymous'] }]);

    const { where, limit } = queries[0];
    expect(limit).toBe(20);
    expect(where.projectId).toBe(1);
    expect(where.publishDate).toEqual({ [Op.ne]: null });
    expect(where[Op.and]).toEqual([
      { title: { [Op.like]: '%Stad%' } },
      { title: { [Op.like]: '%ma\\_ker%' } },
      { id: { [Op.notIn]: [5] } },
    ]);
  });

  it('applies the tag filter and clamps the limit', async () => {
    await request(createApp()).get(
      '/project/1/link-options/openstad?search=stad&tags=3,4&limit=500'
    );

    expect(scopes[1]).toEqual({ method: ['selectTags', ['3', '4']] });
    expect(queries[0].limit).toBe(50);
  });

  it('uses a plugin source for other keys', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/fixture-source?search=fix&limit=5'
    );

    expect(res.body).toEqual([{ id: 'a1', label: 'Fixture item' }]);
    expect(fixtureSource.search).toHaveBeenCalledWith({
      project: { id: 1 },
      query: 'fix',
      limit: 5,
    });
  });

  it('returns 404 for an unknown source', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/unknown?search=fix'
    );
    expect(res.status).toBe(404);
  });

  it('loads items of a plugin source by id', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/fixture-source/items?ids=a1,b2'
    );
    expect(res.body).toEqual([
      { id: 'a1', label: 'a1' },
      { id: 'b2', label: 'b2' },
    ]);
  });

  it('loads openstad items by id', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/openstad/items?ids=2,3'
    );
    expect(res.status).toBe(200);
    expect(queries[0].where).toMatchObject({ projectId: 1, id: [2, 3] });
    expect(scopes).toContain('includeTags');
    expect(res.body[0].tagIds).toEqual(['8']);
  });

  it('rejects more than 50 ids', async () => {
    const ids = Array.from({ length: 51 }, (_, i) => i + 1).join(',');
    const res = await request(createApp()).get(
      `/project/1/link-options/openstad/items?ids=${ids}`
    );
    expect(res.status).toBe(422);
  });

  it('lists the own submissions of a logged in user without search', async () => {
    const res = await request(createApp({ role: 'member', id: 10 })).get(
      '/project/1/link-options/openstad?mine=1&tags=3'
    );

    expect(res.status).toBe(200);
    expect(queries[0].where.userId).toBe(10);
    expect(scopes[1]).toEqual({ method: ['selectTags', ['3']] });
  });

  it('requires login for own submissions', async () => {
    const res = await request(createApp()).get(
      '/project/1/link-options/openstad?mine=1'
    );
    expect(res.status).toBe(401);
  });

  it('marks the own submissions of the logged in user', async () => {
    const app = createApp({ role: 'member', id: 10 });
    const search = await request(app).get(
      '/project/1/link-options/openstad?search=stad'
    );
    const items = await request(app).get(
      '/project/1/link-options/openstad/items?ids=2,3'
    );

    expect(search.body.map((option) => option.own)).toEqual([true, undefined]);
    expect(items.body.map((option) => option.own)).toEqual([true, undefined]);
    expect(queries[0].attributes).toContain('userId');
    expect(search.body[0]).not.toHaveProperty('userId');
  });

  it('does not filter on owner without mine', async () => {
    await request(createApp({ role: 'member', id: 10 })).get(
      '/project/1/link-options/openstad?search=stad'
    );
    expect(queries[0].where).not.toHaveProperty('userId');
  });
});
