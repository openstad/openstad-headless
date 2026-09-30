import express from 'express';
import { createRequire } from 'module';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// createRequire so the stubs land on the same CJS db object the router holds,
// the pattern the other api-server route suites use (see routes/api/api-token.test.js).
const require = createRequire(import.meta.url);
const db = require('../../db');
const siteTemplate = require('./site-template');

const BASE_URL = '/notification/global/template';

const original = {
  findAll: db.SiteNotificationTemplate.findAll,
  findOne: db.SiteNotificationTemplate.findOne,
  authorizeData: db.SiteNotificationTemplate.authorizeData,
};

// Mounts the router the way the real server does. req.user is what the upstream
// middleware would have resolved; there is no req.project, the global routes are
// deliberately outside a project (see middleware/project.js).
function createApp({ user = { id: 1, role: 'admin' } } = {}) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use(BASE_URL, siteTemplate.router);
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
}

let created;

beforeEach(() => {
  created = [];
  db.SiteNotificationTemplate.findAll = vi.fn().mockResolvedValue([]);
  db.SiteNotificationTemplate.findOne = vi.fn().mockResolvedValue(null);
  db.SiteNotificationTemplate.authorizeData = vi.fn().mockReturnValue({
    create: async (values) => {
      created.push(values);
      return { id: 1, ...values };
    },
  });
});

afterEach(() => {
  db.SiteNotificationTemplate.findAll = original.findAll;
  db.SiteNotificationTemplate.findOne = original.findOne;
  db.SiteNotificationTemplate.authorizeData = original.authorizeData;
});

const validBody = {
  engine: 'email',
  type: 'notification comment - user',
  label: 'Nieuwe reactie',
  subject: 'Je hebt een reactie',
  body: '<mjml>x</mjml>',
};

describe('global notification template routes', () => {
  describe('authorization', () => {
    // The whole point of the separate model: a project editor may read what their
    // project inherits, but only an admin may change it platform-wide.
    it('lets an editor read the global templates', async () => {
      const res = await request(createApp({ user: { id: 5, role: 'editor' } }))
        .get('/notification/global/template')
        .send();

      expect(res.status).toBe(200);
      expect(db.SiteNotificationTemplate.findAll).toHaveBeenCalled();
    });

    it('refuses a create by an editor', async () => {
      const res = await request(createApp({ user: { id: 5, role: 'editor' } }))
        .post('/notification/global/template')
        .send(validBody);

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(created).toEqual([]);
    });

    // What the live server resolves for a visitor without a session.
    it('refuses a create by an anonymous visitor', async () => {
      const res = await request(
        createApp({ user: { id: 0, role: 'anonymous' } })
      )
        .post('/notification/global/template')
        .send(validBody);

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(created).toEqual([]);
    });

    it('refuses a read by an anonymous visitor', async () => {
      const res = await request(
        createApp({ user: { id: 0, role: 'anonymous' } })
      ).get('/notification/global/template');

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(db.SiteNotificationTemplate.findAll).not.toHaveBeenCalled();
    });

    it('allows an admin to create', async () => {
      const res = await request(createApp())
        .post('/notification/global/template')
        .send(validBody);

      expect(res.status).toBe(200);
      expect(created).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('refuses a second template for the same type with 409', async () => {
      db.SiteNotificationTemplate.findOne = vi
        .fn()
        .mockResolvedValue({ id: 1, type: validBody.type });

      const res = await request(createApp())
        .post('/notification/global/template')
        .send(validBody);

      expect(res.status).toBe(409);
      expect(created).toEqual([]);
    });

    it('requires a type', async () => {
      const { type, ...withoutType } = validBody;
      const res = await request(createApp())
        .post('/notification/global/template')
        .send(withoutType);

      expect(res.status).toBe(400);
      expect(created).toEqual([]);
    });

    // The body reaches create whole, so anything outside the form's own columns
    // must be dropped instead of overwriting a row's identity or timestamps.
    it('stores only the writable columns', async () => {
      await request(createApp())
        .post('/notification/global/template')
        .send({ ...validBody, id: 99, createdAt: '2020-01-01', projectId: 7 });

      expect(created[0]).toEqual(validBody);
    });
  });

  describe('update', () => {
    function templateRow(overrides = {}) {
      const row = {
        id: 3,
        type: 'notification comment - user',
        can: () => true,
        updated: null,
        authorizeData(data) {
          row.authorized = data;
          return {
            update: async (values) => {
              row.updated = values;
              return { id: row.id, ...values };
            },
          };
        },
        ...overrides,
      };
      return row;
    }

    it('cannot move a template to another mail type', async () => {
      const row = templateRow();
      db.SiteNotificationTemplate.findOne = vi.fn().mockResolvedValue(row);

      const res = await request(createApp())
        .put('/notification/global/template/3')
        .send({ type: 'login email', subject: 'Andere mail' });

      expect(res.status).toBe(200);
      expect(row.updated).toEqual({ subject: 'Andere mail' });
    });

    it('answers 403 when the row refuses the update', async () => {
      db.SiteNotificationTemplate.findOne = vi
        .fn()
        .mockResolvedValue(templateRow({ can: () => false }));

      const res = await request(createApp())
        .put('/notification/global/template/3')
        .send({ subject: 'x' });

      expect(res.status).toBe(403);
    });

    it('answers 404 for a template that does not exist', async () => {
      db.SiteNotificationTemplate.findOne = vi.fn().mockResolvedValue(null);

      const res = await request(createApp())
        .put('/notification/global/template/3')
        .send({ subject: 'x' });

      expect(res.status).toBe(404);
    });
  });

  describe('read-only project variant', () => {
    function createProjectApp(user = { id: 5, role: 'editor' }) {
      const app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = user;
        req.project = { id: 2 };
        next();
      });
      app.use(
        '/notification/project/:projectId/global-template',
        siteTemplate.readOnlyRouter
      );
      // eslint-disable-next-line no-unused-vars
      app.use((err, req, res, next) => {
        res.status(err.status || 500).json({ message: err.message });
      });
      return app;
    }

    it('lets a project editor read the globals', async () => {
      const res = await request(createProjectApp()).get(
        '/notification/project/2/global-template'
      );

      expect(res.status).toBe(200);
    });

    // No write routes here: a project admin passes an 'admin' role check and must
    // not be able to change platform-wide templates from inside their project.
    it('has no create route', async () => {
      const res = await request(createProjectApp({ id: 5, role: 'admin' }))
        .post('/notification/project/2/global-template')
        .send(validBody);

      expect(res.status).toBe(404);
      expect(created).toEqual([]);
    });
  });
});
