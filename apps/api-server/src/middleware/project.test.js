import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../db');

const origProjectFindOne = db.Project.findOne;

afterEach(() => {
  db.Project.findOne = origProjectFindOne;
});

function createApp() {
  const app = express();
  app.use(require('./project'));
  app.use((req, res) => res.json({ projectId: req.project?.id ?? null }));
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

// ----------------------------------------------------------------------------------------------------
// Bypass paths — middleware calls next() without touching the DB
// ----------------------------------------------------------------------------------------------------

describe('bypass paths', () => {
  it('bypasses /api/widget routes', async () => {
    db.Project.findOne = vi.fn();
    const app = createApp();

    await request(app).get('/api/widget/123');

    expect(db.Project.findOne).not.toHaveBeenCalled();
  });

  it('bypasses /api/pending-budget-vote', async () => {
    db.Project.findOne = vi.fn();
    const app = createApp();

    await request(app).get('/api/pending-budget-vote');

    expect(db.Project.findOne).not.toHaveBeenCalled();
  });

  it('bypasses GET /api/project (list)', async () => {
    db.Project.findOne = vi.fn();
    const app = createApp();

    await request(app).get('/api/project');

    expect(db.Project.findOne).not.toHaveBeenCalled();
  });

  it('bypasses GET /api/user routes', async () => {
    db.Project.findOne = vi.fn();
    const app = createApp();

    await request(app).get('/api/user/1');

    expect(db.Project.findOne).not.toHaveBeenCalled();
  });

  it('bypasses /api/audit-log', async () => {
    db.Project.findOne = vi.fn();
    const app = createApp();

    await request(app).get('/api/audit-log');

    expect(db.Project.findOne).not.toHaveBeenCalled();
  });

  it('bypasses /api/lock routes', async () => {
    db.Project.findOne = vi.fn();
    const app = createApp();

    await request(app).get('/api/lock/abc');

    expect(db.Project.findOne).not.toHaveBeenCalled();
  });
});

// ----------------------------------------------------------------------------------------------------
// Project ID extraction
// ----------------------------------------------------------------------------------------------------

describe('getProjectId extraction', () => {
  it('returns 400 when no project ID is in the path', async () => {
    db.Project.findOne = vi.fn();
    const app = createApp();

    const res = await request(app).get('/api/unknown-path');

    expect(res.status).toBe(400);
    expect(db.Project.findOne).not.toHaveBeenCalled();
  });

  it('looks up the project when path contains /project/:id/', async () => {
    const fakeProject = { id: 5 };
    db.Project.findOne = vi.fn().mockResolvedValue(fakeProject);
    const app = createApp();

    const res = await request(app).get('/api/project/5/resource');

    expect(db.Project.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(res.status).toBe(200);
    expect(res.body.projectId).toBe(5);
  });
});

// ----------------------------------------------------------------------------------------------------
// Project lookup outcomes
// ----------------------------------------------------------------------------------------------------

describe('project lookup', () => {
  it('attaches found project to req.project and calls next', async () => {
    const fakeProject = { id: 3, name: 'Test' };
    db.Project.findOne = vi.fn().mockResolvedValue(fakeProject);
    const app = createApp();

    const res = await request(app).get('/api/project/3/resource');

    expect(res.status).toBe(200);
    expect(res.body.projectId).toBe(3);
  });

  it('returns 404 when project does not exist', async () => {
    db.Project.findOne = vi.fn().mockResolvedValue(null);
    const app = createApp();

    const res = await request(app).get('/api/project/999/resource');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/project/i);
  });

  it('calls next(err) on database error', async () => {
    db.Project.findOne = vi.fn().mockRejectedValue(new Error('DB down'));
    const app = createApp();

    const res = await request(app).get('/api/project/1/resource');

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/DB down/i);
  });
});
