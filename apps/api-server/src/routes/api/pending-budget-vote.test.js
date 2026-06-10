import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const db = require('../../db');

// Originals for restoration
const origCreate = db.PendingBudgetVote.create;
const origTransaction = db.sequelize.transaction;

afterEach(() => {
  db.PendingBudgetVote.create = origCreate;
  db.sequelize.transaction = origTransaction;
});

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(require('./pending-budget-vote'));
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('POST / — create pending budget vote', () => {
  it('creates a record and returns its id', async () => {
    const fakeRecord = { id: 'uuid-1234' };
    db.PendingBudgetVote.create = vi.fn().mockResolvedValue(fakeRecord);

    const app = createApp();
    const res = await request(app)
      .post('/')
      .send({ resource_1: true, resource_2: false });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'uuid-1234');
    expect(db.PendingBudgetVote.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { resource_1: true, resource_2: false } })
    );
  });

  it('returns 400 for non-object payload', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .send('"invalid"');

    expect(res.status).toBe(400);
  });
});

describe('GET /:id — fetch and delete pending budget vote', () => {
  it('returns the stored data and deletes the record', async () => {
    const storedData = { resource_1: true };
    const fakeRecord = {
      id: 'uuid-5678',
      data: storedData,
      destroy: vi.fn().mockResolvedValue(undefined),
    };

    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => {
      const fakeTransaction = { LOCK: { UPDATE: 'UPDATE' } };
      return fn(fakeTransaction);
    });
    db.PendingBudgetVote.findOne = vi.fn().mockResolvedValue(fakeRecord);

    const origFindOne = db.PendingBudgetVote.findOne;

    const app = createApp();
    const res = await request(app).get('/uuid-5678');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'uuid-5678', data: storedData });
    expect(fakeRecord.destroy).toHaveBeenCalled();

    db.PendingBudgetVote.findOne = origFindOne;
  });

  it('returns 404 when record is not found', async () => {
    db.sequelize.transaction = vi.fn().mockImplementation(async (fn) => {
      const fakeTransaction = { LOCK: { UPDATE: 'UPDATE' } };
      return fn(fakeTransaction);
    });

    const origFindOne = db.PendingBudgetVote.findOne;
    db.PendingBudgetVote.findOne = vi.fn().mockResolvedValue(null);

    const app = createApp();
    const res = await request(app).get('/nonexistent-id');

    expect(res.status).toBe(404);

    db.PendingBudgetVote.findOne = origFindOne;
  });
});
