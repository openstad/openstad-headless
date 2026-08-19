import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');

auth.useReqUser = (req, res, next) => next();

const router = require('./widget-version');

const orig = {
  widgetScope: db.Widget.scope,
  versionFindAll: db.WidgetVersion.findAll,
  versionFindOne: db.WidgetVersion.findOne,
  versionCreate: db.WidgetVersion.create,
  versionDestroy: db.WidgetVersion.destroy,
  transaction: db.sequelize.transaction,
};

afterEach(() => {
  db.Widget.scope = orig.widgetScope;
  db.WidgetVersion.findAll = orig.versionFindAll;
  db.WidgetVersion.findOne = orig.versionFindOne;
  db.WidgetVersion.create = orig.versionCreate;
  db.WidgetVersion.destroy = orig.versionDestroy;
  db.sequelize.transaction = orig.transaction;
  vi.clearAllMocks();
});

function stubWidget(widget) {
  db.Widget.scope = vi.fn().mockReturnValue({
    findOne: vi.fn().mockResolvedValue(widget),
  });
}

function fakeWidget(overrides = {}) {
  return {
    id: 12,
    projectId: 2,
    config: { a: 1 },
    can: () => true,
    update: vi.fn().mockImplementation(async function (values) {
      Object.assign(this, values);
      return this;
    }),
    ...overrides,
  };
}

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/project/:projectId/widgets/:widgetId/versions', router);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

const base = '/project/2/widgets/12/versions';

describe('widget version routes — scoping and authorization', () => {
  it('returns 404 when the widget does not belong to the project', async () => {
    stubWidget(null);

    const res = await request(createApp()).get(base);

    expect(res.status).toBe(404);
    expect(db.Widget.scope).toHaveBeenCalled();
  });

  it('returns 403 when the user cannot update the widget', async () => {
    stubWidget(fakeWidget({ can: () => false }));

    const res = await request(createApp()).get(base);

    expect(res.status).toBe(403);
  });

  it('lists versions newest first for an allowed user', async () => {
    stubWidget(fakeWidget());
    db.WidgetVersion.findAll = vi
      .fn()
      .mockResolvedValue([{ id: 2 }, { id: 1 }]);

    const res = await request(createApp()).get(base);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const [args] = db.WidgetVersion.findAll.mock.calls[0];
    expect(args.where).toEqual({ widgetId: 12 });
    expect(args.order[0]).toEqual(['createdAt', 'DESC']);
  });
});

describe('widget version routes — metadata updates', () => {
  it('stores a trimmed name', async () => {
    stubWidget(fakeWidget());
    const version = {
      id: 5,
      pinned: false,
      update: vi.fn().mockResolvedValue({}),
    };
    db.WidgetVersion.findOne = vi.fn().mockResolvedValue(version);

    const res = await request(createApp())
      .patch(`${base}/5`)
      .send({ name: '  Voor de zomer  ' });

    expect(res.status).toBe(200);
    expect(version.update).toHaveBeenCalledWith({ name: 'Voor de zomer' });
  });

  it('rejects an update without any known field', async () => {
    stubWidget(fakeWidget());
    db.WidgetVersion.findOne = vi
      .fn()
      .mockResolvedValue({ id: 5, update: vi.fn() });

    const res = await request(createApp()).patch(`${base}/5`).send({});

    expect(res.status).toBe(400);
  });

  it('returns 404 for a version that belongs to another widget', async () => {
    stubWidget(fakeWidget());
    db.WidgetVersion.findOne = vi.fn().mockResolvedValue(null);

    const res = await request(createApp())
      .patch(`${base}/5`)
      .send({ pinned: true });

    expect(res.status).toBe(404);
  });

  it('prunes once a version is unpinned', async () => {
    stubWidget(fakeWidget());
    const version = {
      id: 5,
      pinned: true,
      update: vi.fn().mockResolvedValue({}),
    };
    db.WidgetVersion.findOne = vi.fn().mockResolvedValue(version);
    db.WidgetVersion.findAll = vi.fn().mockResolvedValue([]);

    const res = await request(createApp())
      .patch(`${base}/5`)
      .send({ pinned: false });

    expect(res.status).toBe(200);
    expect(db.WidgetVersion.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { widgetId: 12, pinned: false } })
    );
  });

  it('does not prune when a version is pinned', async () => {
    stubWidget(fakeWidget());
    db.WidgetVersion.findOne = vi.fn().mockResolvedValue({
      id: 5,
      pinned: false,
      update: vi.fn().mockResolvedValue({}),
    });
    db.WidgetVersion.findAll = vi.fn().mockResolvedValue([]);

    await request(createApp()).patch(`${base}/5`).send({ pinned: true });

    expect(db.WidgetVersion.findAll).not.toHaveBeenCalled();
  });
});

describe('widget version routes — restore', () => {
  function stubTransaction() {
    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));
  }

  it('applies the version config and reports the undo version', async () => {
    const widget = fakeWidget();
    stubWidget(widget);
    stubTransaction();
    db.WidgetVersion.findOne = vi
      .fn()
      .mockResolvedValueOnce({ id: 5, config: { a: 99 } })
      .mockResolvedValueOnce({ id: 9 })
      .mockResolvedValueOnce(null);
    db.WidgetVersion.create = vi.fn().mockResolvedValue({ id: 10 });
    db.WidgetVersion.findAll = vi.fn().mockResolvedValue([]);

    const res = await request(createApp()).post(`${base}/5/restore`);

    expect(res.status).toBe(200);
    expect(res.body.undoVersionId).toBe(9);
    expect(widget.update).toHaveBeenCalledWith(
      { config: { a: 99 } },
      expect.objectContaining({ transaction: expect.anything() })
    );
    expect(db.WidgetVersion.create.mock.calls[0][0].restoredFromId).toBe(5);
  });

  it('fails the request when the snapshot cannot be stored', async () => {
    const widget = fakeWidget();
    stubWidget(widget);
    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => fn({}));
    db.WidgetVersion.findOne = vi
      .fn()
      .mockResolvedValueOnce({ id: 5, config: { a: 99 } })
      .mockResolvedValueOnce({ id: 9 })
      .mockResolvedValueOnce(null);
    db.WidgetVersion.create = vi
      .fn()
      .mockRejectedValue(new Error('database weg'));

    const res = await request(createApp()).post(`${base}/5/restore`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('database weg');
  });
});
