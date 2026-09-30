const express = require('express');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const createError = require('http-errors');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const defaultTemplatesCatalog = require('../../notifications/default-templates-catalog');

// Global notification templates. Same shape as routes/notification/template.js, but
// without a project: one row per type, writable by an admin only (the model's auth).
const router = express.Router({ mergeParams: true });

// Only the columns the admin form owns. The request body reaches create/update whole, so
// an id or a timestamp posted along must not be able to overwrite anything.
const WRITABLE_KEYS = ['engine', 'type', 'label', 'subject', 'body', 'content'];

function pickWritable(body) {
  const data = {};
  for (const key of WRITABLE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body || {}, key)) {
      data[key] = body[key];
    }
  }
  return data;
}

// scopes
// ------
router.all('*', function (req, res, next) {
  req.scope = [];
  return next();
});

// list templates
// --------------
router
  .route('/')
  .get(auth.can('SiteNotificationTemplate', 'list'))
  .get(function (req, res, next) {
    db.SiteNotificationTemplate.scope(req.scope)
      .findAll({ order: [['type', 'ASC']] })
      .then((result) => {
        req.results = result;
        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // create template
  // ---------------
  .post(auth.can('SiteNotificationTemplate', 'create'))
  .post(auth.useReqUser)
  .post(rateLimiter(), function (req, res, next) {
    const data = pickWritable(req.body);
    if (!data.type) {
      return next(createError(400, 'type is required'));
    }

    // One row per type: the unique index would answer with a 500, and the admin form
    // needs to know that the template already exists.
    db.SiteNotificationTemplate.findOne({ where: { type: data.type } })
      .then((existing) => {
        if (existing) {
          return next(
            createError(
              409,
              `A global template for '${data.type}' already exists`
            )
          );
        }
        return db.SiteNotificationTemplate.authorizeData(
          data,
          'create',
          req.user
        )
          .create(data)
          .then((result) => {
            req.results = result;
            return next();
          });
      })
      .catch(next);
  })
  .post(auth.useReqUser)
  .post(function (req, res, next) {
    res.json(req.results);
  });

// list default (fallback) templates
// ----------------------------------
router
  .route('/defaults')
  .get(auth.can('SiteNotificationTemplate', 'list'))
  .get(function (req, res, next) {
    defaultTemplatesCatalog
      .getAllDefaultTemplates()
      .then((result) => {
        req.results = result;
        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  });

// with one template
// -----------------
router
  .route('/:templateId(\\d+)')
  .all(function (req, res, next) {
    db.SiteNotificationTemplate.scope(req.scope)
      .findOne({ where: { id: parseInt(req.params.templateId) } })
      .then((found) => {
        if (!found) {
          return next(createError(404, 'SiteNotificationTemplate not found'));
        }
        req.results = found;
        return next();
      })
      .catch(next);
  })
  .all(auth.useReqUser)

  // view template
  // -------------
  .get(auth.can('SiteNotificationTemplate', 'view'))
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // update template
  // ---------------
  .put(auth.useReqUser)
  .put(rateLimiter(), function (req, res, next) {
    const template = req.results;
    if (!(template && template.can && template.can('update'))) {
      return next(
        createError(403, 'You cannot update this siteNotificationTemplate')
      );
    }
    // `type` identifies the row and is what resolve-template looks up; changing it here
    // would silently move the template to another mail.
    const data = pickWritable(req.body);
    delete data.type;
    template
      .authorizeData(data, 'update')
      .update(data)
      .then((result) => {
        req.results = result;
        return next();
      })
      .catch(next);
  })
  .put(auth.useReqUser)
  .put(function (req, res, next) {
    res.json(req.results);
  })

  // delete template
  // ---------------
  .delete(function (req, res, next) {
    const template = req.results;
    if (!(template && template.can && template.can('delete'))) {
      return next(
        createError(403, 'You cannot delete this siteNotificationTemplate')
      );
    }
    template
      .destroy()
      .then(() => {
        res.json({ template: 'deleted' });
      })
      .catch(next);
  });

// Read-only variant, mounted under /project/:projectId so a project editor can see which
// global template their project inherits and restore it. No write routes: a project admin
// passes an 'admin' role check and must not be able to change platform-wide templates.
const readOnlyRouter = express.Router({ mergeParams: true });

readOnlyRouter
  .route('/')
  .get(auth.can('SiteNotificationTemplate', 'list'))
  .get(function (req, res, next) {
    db.SiteNotificationTemplate.findAll({ order: [['type', 'ASC']] })
      .then((result) => {
        req.results = result;
        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  });

module.exports = { router, readOnlyRouter };
