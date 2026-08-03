import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use createRequire so we get the same CJS module.exports reference as the
// router does; stubbing methods on that shared db object is how the other
// api-server suites (e.g. middleware/user.test.js) avoid a real database.
const require = createRequire(import.meta.url);
const db = require('../../db');
const apiTokenRouter = require('./api-token');

const PROJECT_ID = 2;
const USER_ID = 42;
const BASE_URL = `/project/${PROJECT_ID}/user/${USER_ID}/api-token`;

// Store originals for clean restoration
const originalUserFindOne = db.User.findOne;
const originalApiTokenCreate = db.ApiToken.create;
const originalApiTokenFindAll = db.ApiToken.findAll;
const originalApiTokenFindOne = db.ApiToken.findOne;

// Builds an app that mounts the router the way the real API does
// (mergeParams on /project/:projectId/user/:userId/api-token), with req.user and
// req.project already resolved by the upstream middleware.
function createApp({ user = { id: 1, role: 'admin' }, project } = {}) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    req.project = project === undefined ? { id: PROJECT_ID } : project;
    next();
  });
  app.use('/project/:projectId/user/:userId/api-token', apiTokenRouter);
  // Mirror the api-server error handler: http-errors carry their own status.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
}

beforeEach(() => {
  db.User.findOne = vi
    .fn()
    .mockResolvedValue({ id: USER_ID, projectId: PROJECT_ID });
  // Echo back what the route built, the way Sequelize#create would.
  db.ApiToken.create = vi.fn().mockImplementation(async (values) => ({
    id: 7,
    lastUsedAt: null,
    createdAt: new Date('2026-06-26T12:00:00Z'),
    ...values,
  }));
  db.ApiToken.findAll = vi.fn().mockResolvedValue([]);
});

afterEach(() => {
  db.User.findOne = originalUserFindOne;
  db.ApiToken.create = originalApiTokenCreate;
  db.ApiToken.findAll = originalApiTokenFindAll;
  db.ApiToken.findOne = originalApiTokenFindOne;
});

describe('api-token routes', () => {
  describe('authorization', () => {
    it('rejects a non-admin user with 403', async () => {
      const app = createApp({ user: { id: 1, role: 'member' } });

      const res = await request(app).get(BASE_URL);

      expect(res.status).toBe(403);
      expect(db.ApiToken.findAll).not.toHaveBeenCalled();
    });

    it('rejects a non-admin user on create as well', async () => {
      const app = createApp({ user: { id: 1, role: 'editor' } });

      const res = await request(app).post(BASE_URL).send({ months: '1' });

      expect(res.status).toBe(403);
      expect(db.ApiToken.create).not.toHaveBeenCalled();
    });

    it('returns 404 when no project is resolved', async () => {
      const app = createApp({ project: null });

      const res = await request(app).get(BASE_URL);

      expect(res.status).toBe(404);
    });
  });

  describe('POST / (create)', () => {
    it('creates a token with an expiry for a valid months preset', async () => {
      const before = new Date();

      const res = await request(createApp())
        .post(BASE_URL)
        .send({ months: '3', name: 'Reporting' });

      expect(res.status).toBe(201);
      expect(db.ApiToken.create).toHaveBeenCalledTimes(1);

      const values = db.ApiToken.create.mock.calls[0][0];
      expect(values.userId).toBe(USER_ID);
      expect(values.projectId).toBe(PROJECT_ID);
      expect(values.name).toBe('Reporting');
      expect(values.expiresAt).toBeInstanceOf(Date);
      expect(values.expiresAt.getTime()).toBeGreaterThan(before.getTime());
      expect(res.body.status).toBe('active');
    });

    it.each([
      ['1', 27],
      ['3', 88],
      ['12', 363],
    ])(
      'places the expiry of the "%s"-month preset in the right window',
      async (months, minDays) => {
        const before = Date.now();

        const res = await request(createApp()).post(BASE_URL).send({ months });

        expect(res.status).toBe(201);
        const { expiresAt } = db.ApiToken.create.mock.calls[0][0];
        const days = (expiresAt.getTime() - before) / (24 * 60 * 60 * 1000);
        // Wide enough for month-length and DST variation, narrow enough to
        // catch a preset that maps to the wrong number of months.
        expect(days).toBeGreaterThanOrEqual(minDays);
        expect(days).toBeLessThan(minDays + 10);
      }
    );

    it('sends the plaintext token once and never stores or returns the hash', async () => {
      const res = await request(createApp())
        .post(BASE_URL)
        .send({ months: '1' });

      expect(res.status).toBe(201);
      expect(res.body.token).toMatch(/^osr_/);
      expect(res.body).not.toHaveProperty('tokenHash');

      // The stored value is a sha256 of the plaintext, not the plaintext itself.
      const values = db.ApiToken.create.mock.calls[0][0];
      expect(values.tokenHash).toBe(
        require('crypto')
          .createHash('sha256')
          .update(res.body.token)
          .digest('hex')
      );
      expect(res.body.tokenPrefix).toBe(res.body.token.slice(0, 8));
      expect(res.body.lastFour).toBe(res.body.token.slice(-4));
    });

    it.each([[''], [null], [undefined]])(
      'falls back to the 12-month default when months is "%s"',
      async (months) => {
        const before = Date.now();

        const res = await request(createApp()).post(BASE_URL).send({ months });

        expect(res.status).toBe(201);
        const { expiresAt } = db.ApiToken.create.mock.calls[0][0];
        const days = (expiresAt.getTime() - before) / (24 * 60 * 60 * 1000);
        expect(days).toBeGreaterThanOrEqual(363);
        expect(days).toBeLessThan(373);
      }
    );

    it('falls back to the 12-month default when months is omitted', async () => {
      const before = Date.now();

      const res = await request(createApp()).post(BASE_URL).send({});

      expect(res.status).toBe(201);
      const { expiresAt } = db.ApiToken.create.mock.calls[0][0];
      const days = (expiresAt.getTime() - before) / (24 * 60 * 60 * 1000);
      expect(days).toBeGreaterThanOrEqual(363);
      expect(days).toBeLessThan(373);
    });

    it('never creates a token without an expiry date', async () => {
      const res = await request(createApp()).post(BASE_URL).send({});

      expect(res.status).toBe(201);
      expect(db.ApiToken.create.mock.calls[0][0].expiresAt).toBeInstanceOf(
        Date
      );
    });

    it('accepts the numeric months the admin form sends', async () => {
      const res = await request(createApp()).post(BASE_URL).send({ months: 3 });

      expect(res.status).toBe(201);
      expect(db.ApiToken.create.mock.calls[0][0].expiresAt).toBeInstanceOf(
        Date
      );
    });

    it('stores a null name when none is given', async () => {
      const res = await request(createApp()).post(BASE_URL).send({});

      expect(res.status).toBe(201);
      expect(db.ApiToken.create.mock.calls[0][0].name).toBeNull();
    });

    // 'toString'/'constructor' guard against a plain object lookup, which also
    // resolves Object.prototype members and would yield an Invalid Date.
    it.each([
      ['7'],
      ['0'],
      ['abc'],
      ['-1'],
      ['none'],
      ['toString'],
      ['constructor'],
    ])('rejects an invalid months value ("%s") with 400', async (months) => {
      const res = await request(createApp()).post(BASE_URL).send({ months });

      expect(res.status).toBe(400);
      expect(db.ApiToken.create).not.toHaveBeenCalled();
    });

    it('returns 404 when the target user is not in this project', async () => {
      db.User.findOne = vi.fn().mockResolvedValue(null);

      const res = await request(createApp())
        .post(BASE_URL)
        .send({ months: '1' });

      expect(res.status).toBe(404);
      expect(db.ApiToken.create).not.toHaveBeenCalled();
    });

    it('passes a database failure to the error handler', async () => {
      db.ApiToken.create = vi.fn().mockRejectedValue(new Error('db down'));

      const res = await request(createApp())
        .post(BASE_URL)
        .send({ months: '1' });

      expect(res.status).toBe(500);
    });
  });

  describe('GET / (list)', () => {
    it('returns the masked fields the admin list needs and nothing secret', async () => {
      db.ApiToken.findAll = vi.fn().mockResolvedValue([
        {
          id: 1,
          userId: USER_ID,
          projectId: PROJECT_ID,
          name: 'Reporting',
          tokenHash: 'should-never-be-exposed',
          tokenPrefix: 'osr_abcd',
          lastFour: 'wxyz',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          lastUsedAt: new Date('2026-06-26T12:00:00Z'),
          createdAt: new Date('2026-06-01T12:00:00Z'),
          deletedAt: null,
        },
      ]);

      const res = await request(createApp()).get(BASE_URL);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toEqual({
        id: 1,
        userId: USER_ID,
        projectId: PROJECT_ID,
        name: 'Reporting',
        tokenPrefix: 'osr_abcd',
        lastFour: 'wxyz',
        expiresAt: expect.any(String),
        lastUsedAt: '2026-06-26T12:00:00.000Z',
        createdAt: '2026-06-01T12:00:00.000Z',
        status: 'active',
      });
    });

    // Since this PR the list opts out of paranoid mode, so revoked tokens come
    // back too and the status field is what tells them apart.
    it('computes the status of each listed token', async () => {
      const hour = 60 * 60 * 1000;
      db.ApiToken.findAll = vi.fn().mockResolvedValue([
        { id: 1, expiresAt: new Date(Date.now() + hour), deletedAt: null },
        { id: 2, expiresAt: new Date(Date.now() - hour), deletedAt: null },
        { id: 3, expiresAt: null, deletedAt: null },
        { id: 4, expiresAt: null, deletedAt: new Date(Date.now() - hour) },
      ]);

      const res = await request(createApp()).get(BASE_URL);

      expect(res.status).toBe(200);
      // The third row has no expiry at all, which new tokens can no longer be:
      // it fails closed to 'expired' rather than showing as valid forever.
      expect(res.body.map((token) => token.status)).toEqual([
        'active',
        'expired',
        'expired',
        'revoked',
      ]);
    });

    it('includes revoked tokens by opting out of paranoid mode', async () => {
      await request(createApp()).get(BASE_URL);

      expect(db.ApiToken.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ paranoid: false })
      );
    });

    it('scopes the query to this user and project, newest first', async () => {
      const res = await request(createApp()).get(BASE_URL);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      // objectContaining, so a later change that adds a query option does not
      // break this test.
      expect(db.ApiToken.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID, projectId: PROJECT_ID },
          order: [['createdAt', 'DESC']],
        })
      );
    });

    it('passes a database failure to the error handler', async () => {
      db.ApiToken.findAll = vi.fn().mockRejectedValue(new Error('db down'));

      const res = await request(createApp()).get(BASE_URL);

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /:tokenId (revoke)', () => {
    const TOKEN_ID = 7;
    const DELETE_URL = `${BASE_URL}/${TOKEN_ID}`;

    function mockStoredToken() {
      const token = {
        id: TOKEN_ID,
        destroy: vi.fn().mockResolvedValue(undefined),
      };
      db.ApiToken.findOne = vi.fn().mockResolvedValue(token);
      return token;
    }

    it('soft-deletes the token so it stops authenticating immediately', async () => {
      const token = mockStoredToken();

      const res = await request(createApp()).delete(DELETE_URL);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
      // destroy() on a paranoid model sets deletedAt; the auth middleware looks
      // tokens up without `paranoid: false`, so the row is invisible from the
      // next request on.
      expect(token.destroy).toHaveBeenCalledTimes(1);
    });

    it('only revokes a token belonging to this user and project', async () => {
      mockStoredToken();

      await request(createApp()).delete(DELETE_URL);

      expect(db.ApiToken.findOne).toHaveBeenCalledWith({
        where: { id: TOKEN_ID, userId: USER_ID, projectId: PROJECT_ID },
      });
    });

    it('returns 404 for a token that is not there', async () => {
      db.ApiToken.findOne = vi.fn().mockResolvedValue(null);

      const res = await request(createApp()).delete(DELETE_URL);

      expect(res.status).toBe(404);
    });

    it('rejects a non-admin user with 403', async () => {
      const token = mockStoredToken();

      const res = await request(
        createApp({ user: { id: 1, role: 'editor' } })
      ).delete(DELETE_URL);

      expect(res.status).toBe(403);
      expect(token.destroy).not.toHaveBeenCalled();
    });

    it('passes a database failure to the error handler', async () => {
      db.ApiToken.findOne = vi.fn().mockRejectedValue(new Error('db down'));

      const res = await request(createApp()).delete(DELETE_URL);

      expect(res.status).toBe(500);
    });
  });
});
