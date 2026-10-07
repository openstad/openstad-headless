import express from 'express';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';
process.env.IMAGE_APP_URL = 'https://images.example';

const require = createRequire(import.meta.url);
const { Op } = require('sequelize');
const db = require('../../db');
const resourceRouter = require('./resource');

// Project 1 is the caller's project; project 2 is someone else's; 0 is global.
const tags = [
  { id: 1, projectId: 1 },
  { id: 2, projectId: 2 },
  { id: 3, projectId: 0 },
];
const statuses = [
  { id: 10, projectId: 1 },
  { id: 20, projectId: 2 },
];

function findRows(rows) {
  return async ({ where }) =>
    rows.filter((row) => {
      if (where.addToNewResources) return false;
      const ids = where.id?.[Op.in];
      if (ids && !ids.includes(row.id)) return false;
      const projectIds = where.projectId?.[Op.or] ?? [where.projectId];
      return projectIds.some((p) => p == row.projectId);
    });
}

const setTags = vi.fn(async () => {});
const setStatuses = vi.fn(async () => {});

function createdResource() {
  return {
    id: 50,
    projectId: 1,
    extraData: {},
    setTags,
    setStatuses,
    auth: { canMutateStatus: () => true },
    toJSON: () => ({ id: 50 }),
  };
}

db.Tag.findAll = findRows(tags);
db.Status.findAll = findRows(statuses);
db.Resource.create = async () => createdResource();
db.Resource.scope = () => ({
  findByPk: async () => createdResource(),
  findOne: async () => createdResource(),
});

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { role: 'member', id: 7, projectId: 1 };
    req.project = {
      id: 1,
      config: { resources: { canAddNewResources: true } },
    };
    next();
  });
  app.use('/project/:projectId(\\d+)/resource', resourceRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

describe('POST resource only attaches tags and statuses of its own project', () => {
  beforeEach(() => vi.clearAllMocks());

  it('drops tags and statuses that belong to another project', async () => {
    const res = await request(createApp())
      .post('/project/1/resource?nomail=1')
      .send({ title: 'x', tags: [1, 2, 3], statuses: [10, 20] });

    expect(res.status).toBe(200);
    expect(setTags).toHaveBeenCalledWith([1, 3]);
    expect(setStatuses).toHaveBeenCalledWith([10]);
  });
});
