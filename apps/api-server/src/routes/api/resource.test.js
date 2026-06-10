import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../../db');

const origResourceCan = db.Resource.can;
const origResourceScope = db.Resource.scope;
const origResourceCreate = db.Resource.create;
const origResourceAuthorizeData = db.Resource.authorizeData;
const origResourceDestroy = db.Resource.destroy;
const origWidgetFindAll = db.Widget.findAll;
const origStatusFindAll = db.Status.findAll;
const origTagFindAll = db.Tag.findAll;

afterEach(() => {
  db.Resource.can = origResourceCan;
  db.Resource.scope = origResourceScope;
  db.Resource.create = origResourceCreate;
  db.Resource.authorizeData = origResourceAuthorizeData;
  db.Resource.destroy = origResourceDestroy;
  db.Widget.findAll = origWidgetFindAll;
  db.Status.findAll = origStatusFindAll;
  db.Tag.findAll = origTagFindAll;
  delete process.env.IMAGE_APP_URL;
});

function makeProject(overrides = {}) {
  return {
    id: 1,
    config: {
      archivedVotes: false,
      votes: { isViewable: false },
      resources: { canAddNewResources: true },
      ...overrides.config,
    },
    ...overrides,
  };
}

function makeUser(role = 'member') {
  return { id: 1, role };
}

function makeResource(overrides = {}) {
  return {
    id: 42,
    projectId: 1,
    title: 'Test Resource',
    widgetId: null,
    auth: {
      user: null,
      canMutateStatus: vi.fn().mockReturnValue(false),
    },
    can: vi.fn().mockReturnValue(true),
    destroy: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createApp({ project, user } = {}) {
  const app = express();
  app.use(express.json());
  app.use('/:projectId', (req, res, next) => {
    req.project = project;
    req.user = user;
    req.dbQuery = { where: {} };
    next();
  });
  app.use('/:projectId', require('./resource'));
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

// ----------------------------------------------------------------------------------------------------
// GET / — list resources
// ----------------------------------------------------------------------------------------------------

describe('GET / — list resources', () => {
  it('returns an error when user lacks list permission', async () => {
    db.Resource.can = vi.fn().mockReturnValue(false);

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).get('/1/');

    expect(res.status).not.toBe(200);
    expect(res.body.error).toMatch(/cannot list/i);
  });

  it('returns 200 with resource list', async () => {
    const resource = makeResource();
    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findAndCountAll: vi
        .fn()
        .mockResolvedValue({ rows: [resource], count: 1 }),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).get('/1/');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ----------------------------------------------------------------------------------------------------
// GET /:id — view single resource
// ----------------------------------------------------------------------------------------------------

describe('GET /:id — view single resource', () => {
  it('returns 404 when resource does not exist', async () => {
    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).get('/1/42');

    expect(res.status).toBe(404);
  });

  it('returns 200 with the resource', async () => {
    const resource = makeResource();
    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(resource),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).get('/1/42');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 42);
  });
});

// ----------------------------------------------------------------------------------------------------
// POST / — create resource (guard conditions)
// ----------------------------------------------------------------------------------------------------

describe('POST / — create resource guards', () => {
  it('returns 400 for a request with an image from a disallowed domain', async () => {
    process.env.IMAGE_APP_URL = 'https://images.allowed.com';
    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app)
      .post('/1/')
      .send({
        title: 'New',
        images: [{ url: 'https://evil.attacker.com/img.jpg' }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid image/i);
  });

  it('returns 401 when canAddNewResources is false', async () => {
    db.Resource.can = vi.fn().mockReturnValue(true);

    const app = createApp({
      project: makeProject({
        config: {
          archivedVotes: false,
          votes: { isViewable: false },
          resources: { canAddNewResources: false },
        },
      }),
      user: makeUser(),
    });
    const res = await request(app).post('/1/').send({ title: 'New' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/gesloten/i);
  });

  it('returns 500 when IMAGE_APP_URL is not set', async () => {
    db.Resource.can = vi.fn().mockReturnValue(true);
    delete process.env.IMAGE_APP_URL;

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).post('/1/').send({ title: 'New' });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/image server/i);
  });
});

// ----------------------------------------------------------------------------------------------------
// PUT /:id — update resource (guard conditions)
// ----------------------------------------------------------------------------------------------------

describe('PUT /:id — update resource guards', () => {
  it('returns 401 when canAddNewResources is false and resource is not a concept', async () => {
    const resource = makeResource({
      dataValues: { publishDate: null },
      authorizeData: vi.fn().mockReturnThis(),
    });

    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(resource),
    });

    const app = createApp({
      project: makeProject({
        config: {
          archivedVotes: false,
          votes: { isViewable: false },
          resources: { canAddNewResources: false },
        },
      }),
      user: makeUser(),
    });

    const res = await request(app).put('/1/42').send({ title: 'Updated' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/gesloten/i);
  });
});

// ----------------------------------------------------------------------------------------------------
// DELETE /:id — delete resource
// ----------------------------------------------------------------------------------------------------

describe('DELETE /:id — delete resource', () => {
  it('returns 500 when resource.can("delete") returns false', async () => {
    const resource = makeResource({ can: vi.fn().mockReturnValue(false) });

    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(resource),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).delete('/1/42');

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/cannot delete/i);
  });

  it('returns 200 when resource is deleted', async () => {
    const resource = makeResource();

    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(resource),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).delete('/1/42');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('resource', 'deleted');
    expect(resource.destroy).toHaveBeenCalled();
  });
});
