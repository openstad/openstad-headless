const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const {
  sanitizeAuthConfigForDuplication,
} = require('../../services/authClientSync');
const projectTemplate = require('../../services/projectTemplate');

const express = require('express');
const router = express.Router({ mergeParams: true });

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
    db.Template.findAll()
      .then((templates) => {
        const sorted = [...templates].sort((a, b) =>
          String(a.name).localeCompare(String(b.name))
        );
        res.json(sorted.map((template) => template.toJSON(req.user)));
      })
      .catch(next);
  })

  .post(auth.can('Template', 'create'))
  .post(function (req, res, next) {
    if (!req.body.name || !String(req.body.name).trim())
      return next(createError(400, 'Geen naam opgegeven'));
    const hasSource =
      req.body.sourceProjectId !== undefined &&
      req.body.sourceProjectId !== null &&
      String(req.body.sourceProjectId).trim() !== '';
    if (!hasSource && (!req.body.data || typeof req.body.data !== 'object'))
      return next(createError(400, 'Geen geldige template-data opgegeven'));
    return next();
  })
  .post(rateLimiter(), async function (req, res, next) {
    try {
      const data = req.body.sourceProjectId
        ? await projectTemplate.buildProjectTemplateSnapshot(
            parseInt(req.body.sourceProjectId, 10)
          )
        : req.body.data;

      data.config = sanitizeAuthConfigForDuplication(data.config || {});
      delete data.config.uniqueId;
      data.resources = await projectTemplate.anonymizeResourceOwners(
        data.resources
      );

      const template = await db.Template.create({
        name: req.body.name,
        data,
      });
      res.json(template.toJSON(req.user));
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
    res.json(req.template.toJSON(req.user));
  })

  // rename only; template content is an immutable snapshot
  .put(auth.can('Template', 'update'))
  .put(rateLimiter(), function (req, res, next) {
    if (!req.body.name || !String(req.body.name).trim())
      return next(createError(400, 'Geen naam opgegeven'));

    req.template
      .update({ name: req.body.name })
      .then((template) => {
        res.json(template.toJSON(req.user));
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
