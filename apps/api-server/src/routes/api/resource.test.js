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
const origProjectScope = db.Project.scope;

afterEach(() => {
  db.Resource.can = origResourceCan;
  db.Resource.scope = origResourceScope;
  db.Resource.create = origResourceCreate;
  db.Resource.authorizeData = origResourceAuthorizeData;
  db.Resource.destroy = origResourceDestroy;
  db.Widget.findAll = origWidgetFindAll;
  db.Status.findAll = origStatusFindAll;
  db.Tag.findAll = origTagFindAll;
  db.Project.scope = origProjectScope;
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

  // NOTE: the source rejects view permission via auth.can('Resource','view'),
  // which throws a bare Error (status 500). Ideally this should be a 4xx (401/403),
  // but we assert current behavior here without changing the source.
  it('rejects read when user lacks view permission', async () => {
    const resource = makeResource();
    // list/findOne pass, but the 'view' check fails
    // auth.can('Resource', action) invokes the static as can(action, user)
    db.Resource.can = vi
      .fn()
      .mockImplementation((action) => (action === 'view' ? false : true));
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(resource),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).get('/1/42');

    expect(res.status).not.toBe(200);
    expect(res.body.error).toMatch(/cannot view/i);
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
    // The source returns the 400 from inside an images.forEach() callback, which
    // does not halt createResource — it still issues the create afterwards. Stub
    // the create so this does not hit a real DB (the 400 response is already
    // sent). NOTE: latent source bug — a rejected image should not still create
    // the resource; worth a separate fix.
    db.Resource.authorizeData = vi.fn().mockReturnValue({
      create: vi.fn(() => new Promise(() => {})),
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

  // NOTE: the source rejects create permission via auth.can('Resource','create'),
  // which throws a bare Error (status 500). Ideally this should be a 4xx (401/403),
  // but we assert current behavior here without changing the source.
  it('rejects create when user lacks create permission', async () => {
    process.env.IMAGE_APP_URL = 'https://images.allowed.com';
    // auth.can('Resource', action) invokes the static as can(action, user)
    db.Resource.can = vi
      .fn()
      .mockImplementation((action) => (action === 'create' ? false : true));
    const createSpy = vi.fn();
    db.Resource.create = createSpy;

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).post('/1/').send({ title: 'New' });

    expect(res.status).not.toBe(200);
    expect(res.body.error).toMatch(/cannot create/i);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('creates a resource on the happy path and returns the authorized resource', async () => {
    process.env.IMAGE_APP_URL = 'https://images.allowed.com';

    const createdInstance = makeResource({ id: 99 });
    const createSpy = vi.fn().mockResolvedValue(createdInstance);
    // authorizeData returns the model with .create chained off it
    db.Resource.authorizeData = vi.fn().mockReturnValue({ create: createSpy });

    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Status.findAll = vi.fn().mockResolvedValue([]);
    db.Tag.findAll = vi.fn().mockResolvedValue([]);

    // findByPk (after create) then findOne (after tags/statuses refetch)
    const refetched = makeResource({
      id: 99,
      getTags: vi.fn().mockResolvedValue([]),
    });
    db.Resource.scope = vi.fn().mockReturnValue({
      findByPk: vi.fn().mockResolvedValue(createdInstance),
      findOne: vi.fn().mockResolvedValue(refetched),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).post('/1/').send({ title: 'New Resource' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 99);

    // authorizeData called with the create action, the user and the project
    expect(db.Resource.authorizeData).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Resource',
        projectId: '1',
        userId: 1,
      }),
      'create',
      expect.objectContaining({ id: 1 }),
      null,
      expect.objectContaining({ id: 1 })
    );
    // create called with the assembled data payload
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Resource',
        projectId: '1',
        userId: 1,
        widgetId: null,
        isSpam: false,
      })
    );
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

  // NOTE: the source rejects update via resource.can('update') with a bare Error
  // (status 500). Ideally this should be a 4xx (401/403), but we assert current
  // behavior here without changing the source.
  it('rejects update when resource.can("update") is false', async () => {
    const updateSpy = vi.fn();
    const resource = makeResource({
      dataValues: { publishDate: '2026-01-01' },
      can: vi.fn().mockReturnValue(false),
      authorizeData: vi.fn().mockReturnValue({ update: updateSpy }),
    });

    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(resource),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).put('/1/42').send({ title: 'Updated' });

    expect(res.status).not.toBe(200);
    expect(res.body.error).toMatch(/cannot update/i);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('updates a resource on the happy path with the submitted data', async () => {
    const updatedInstance = makeResource({
      id: 42,
      title: 'Updated',
      auth: { canMutateStatus: vi.fn().mockReturnValue(false) },
    });
    const updateSpy = vi.fn().mockResolvedValue(updatedInstance);
    const authorizeDataSpy = vi.fn().mockReturnValue({ update: updateSpy });

    const resource = makeResource({
      dataValues: { publishDate: '2026-01-01' },
      can: vi.fn().mockReturnValue(true),
      authorizeData: authorizeDataSpy,
    });

    db.Resource.can = vi.fn().mockReturnValue(true);
    db.Resource.scope = vi.fn().mockReturnValue({
      findOne: vi.fn().mockResolvedValue(resource),
    });
    // The update notification step reads the project's emailConfig; stub the
    // lookup so it does not hit a real DB (which would log a connection error).
    db.Project.scope = vi.fn().mockReturnValue({
      findByPk: vi.fn().mockResolvedValue(null),
    });

    const app = createApp({ project: makeProject(), user: makeUser() });
    const res = await request(app).put('/1/42').send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 42);

    // authorizeData called with the update action
    expect(authorizeDataSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated' }),
      'update'
    );
    // update called with the submitted payload
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated' })
    );
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
