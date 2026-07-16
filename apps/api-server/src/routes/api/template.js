const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const {
  sanitizeAuthConfigForDuplication,
} = require('../../services/authClientSync');

const express = require('express');
const router = express.Router({ mergeParams: true });

// Replace non-admin resource owners with an anonymous sentinel and strip
// embedded user objects, so template snapshots (which can be exported) never
// contain PII of regular users. Admin/editor owners keep their userId; the
// project-create duplication flow copies those users into the new project.
async function anonymizeResourceOwners(resources) {
  if (!Array.isArray(resources)) return resources;

  const roleByUserId = {};
  for (const resource of resources) {
    if (!resource || typeof resource !== 'object') continue;
    delete resource.user;

    const userId = resource.userId;
    const normalizedUserId =
      typeof userId === 'number' && Number.isInteger(userId)
        ? userId
        : typeof userId === 'string' && /^\d+$/.test(userId)
          ? parseInt(userId, 10)
          : null;

    if (normalizedUserId === null) {
      resource.userId = 'anonymous';
      continue;
    }

    if (!(normalizedUserId in roleByUserId)) {
      const user = await db.User.findOne({
        where: { id: normalizedUserId },
        attributes: ['id', 'role'],
      });
      roleByUserId[normalizedUserId] = user ? user.role : null;
    }

    const role = roleByUserId[normalizedUserId];
    if (!role || !hasRole({ role }, 'editor')) {
      resource.userId = 'anonymous';
    }
  }

  return resources;
}

// backwards compatibility: external template catalog
router
  .route('/project')
  .get(pagination.init)
  .get(function (req, res, next) {
    if (
      config.templateSource === 'DB' ||
      config.templateSource === 'DATABASE'
    ) {
      req.results = { 'Too soon': 'Not yet implemented' };
      next();
    } else {
      return fetch(config.templateSource, {
        headers: { 'Content-type': 'application/json' },
      })
        .then((response) => {
          if (!response.ok) throw Error(response);
          return response.json();
        })
        .then((json) => {
          req.results = json;
          return next();
        })
        .catch((err) => {
          console.log('Fetch templates: niet goed');
          next({ message: 'Error fetching templates' });
        });
    }
  })
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    res.json(req.results);
  });

router
  .route('/')
  .get(auth.can('Template', 'list'))
  .get(function (req, res, next) {
    db.Template.findAll({ order: [['name', 'ASC']] })
      .then((templates) => {
        res.json(templates);
      })
      .catch(next);
  })

  .post(auth.can('Template', 'create'))
  .post(function (req, res, next) {
    if (!req.body.name || !String(req.body.name).trim())
      return next(createError(400, 'Geen naam opgegeven'));
    if (!req.body.data || typeof req.body.data !== 'object')
      return next(createError(400, 'Geen geldige template-data opgegeven'));
    return next();
  })
  .post(rateLimiter(), async function (req, res, next) {
    try {
      const data = req.body.data;
      data.config = sanitizeAuthConfigForDuplication(data.config || {});
      delete data.config.uniqueId;
      data.resources = await anonymizeResourceOwners(data.resources);

      const template = await db.Template.create({
        name: req.body.name,
        data,
      });
      res.json(template);
    } catch (err) {
      next(err);
    }
  });

router
  .route('/:templateId(\\d+)')
  .all(function (req, res, next) {
    db.Template.findOne({ where: { id: parseInt(req.params.templateId, 10) } })
      .then((found) => {
        if (!found) return next(createError(404, 'Template not found'));
        req.template = found;
        next();
      })
      .catch(next);
  })

  .get(auth.can('Template', 'view'))
  .get(function (req, res, next) {
    res.json(req.template);
  })

  // rename only; template content is an immutable snapshot
  .put(auth.can('Template', 'update'))
  .put(rateLimiter(), function (req, res, next) {
    if (!req.body.name || !String(req.body.name).trim())
      return next(createError(400, 'Geen naam opgegeven'));

    req.template
      .update({ name: req.body.name })
      .then((template) => {
        res.json(template);
      })
      .catch(next);
  })

  .delete(auth.can('Template', 'delete'))
  .delete(function (req, res, next) {
    req.template
      .destroy()
      .then(() => {
        res.json({ template: 'deleted' });
      })
      .catch(next);
  });

module.exports = router;
