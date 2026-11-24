const express = require('express');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const router = express.Router({ mergeParams: true });
const createError = require('http-errors');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const {
  loadDefaultTemplate,
  renderTemplate,
} = require('../../models/NotificationMessage');
const { mailStylingFor } = require('../../services/mail-styling');
const { previewData } = require('../../notifications/preview-data');
const {
  assertValidContent,
  isContentType,
  fixedBlockDescription,
} = require('../../notifications/content-catalog');
const { buildContentMjml } = require('../../notifications/content-layout');

const PREVIEW_ENGINES = ['email', 'sms'];

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
  .get(auth.can('NotificationTemplate', 'list'))
  .get(function (req, res, next) {
    db.NotificationTemplate.scope(req.scope)
      .findAndCountAll({
        where: {
          projectId: req.params.projectId,
        },
      })
      .then((result) => {
        req.results = result.rows;
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
  .post(auth.can('NotificationTemplate', 'create'))
  .post(auth.useReqUser)
  .post(function (req, res, next) {
    // validations
    return next();
  })
  .post(rateLimiter(), function (req, res, next) {
    let data = {
      ...req.body,
      projectId: req.params.projectId,
    };
    db.NotificationTemplate.authorizeData(data, 'create', req.user)
      .create(data)
      .then((result) => {
        db.NotificationTemplate.findByPk(result.id).then(
          function (notificationTemplate) {
            req.results = notificationTemplate;
            return next();
          }
        );
      })
      .catch(next);
  })
  .post(auth.useReqUser)
  .post(function (req, res, next) {
    res.json(req.results);
  });

// with one template
// -----------------
router
  .route('/:templateId(\\d+)')
  .all(function (req, res, next) {
    let templateId = parseInt(req.params.templateId) || 1;
    db.NotificationTemplate.scope(req.scope)
      .findOne({
        where: { id: templateId, projectId: req.params.projectId },
      })
      .then((found) => {
        if (!found) {
          return next(createError(404, 'NotificationTemplate not found'));
        }
        req.results = found;
        next();
      })
      .catch(next);
  })
  .all(auth.useReqUser)

  // view template
  // -------------
  .get(auth.can('NotificationTemplate', 'view'))
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // update template
  // ---------------
  .put(auth.useReqUser)
  .put(rateLimiter(), function (req, res, next) {
    let template = req.results;
    if (!(template && template.can && template.can('update')))
      return next(new Error('You cannot update this notificationTemplate'));
    template
      .authorizeData(req.body, 'update')
      .update(req.body)
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
    let template = req.results;
    if (!(template && template.can && template.can('delete')))
      return next(new Error('You cannot delete this notificationTemplate'));
    req.results
      .destroy()
      .then(() => {
        res.json({ template: 'deleted' });
      })
      .catch(next);
  });

router
  .route('/preview')
  .post(auth.can('NotificationTemplate', 'create'))
  .post(rateLimiter(), async function (req, res, next) {
    const { type, engine, subject, content } = req.body;

    if (!PREVIEW_ENGINES.includes(engine)) {
      return next(createError(400, 'engine must be email or sms'));
    }
    if (typeof subject !== 'string') {
      return next(createError(400, 'subject must be a string'));
    }

    try {
      let body = req.body.body;
      if (content !== undefined && content !== null) {
        if (!isContentType(type)) {
          throw createError(400, `Notification type '${type}' has no fields`);
        }
        try {
          assertValidContent(content);
        } catch (err) {
          throw createError(400, err.message);
        }
        body = buildContentMjml(type, content);
      } else if (typeof body !== 'string') {
        throw createError(400, 'body must be a string');
      }

      const project = await db.Project.scope(
        'includeConfig',
        'includeEmailConfig'
      ).findByPk(req.params.projectId);
      if (!project) {
        throw createError(404, 'Project not found');
      }

      const styling = await mailStylingFor(project);
      let rendered;
      try {
        rendered = await renderTemplate(
          { subject, body },
          previewData({ project, styling }),
          { engine, type, projectId: project.id }
        );
      } catch (err) {
        throw createError(
          400,
          `De template kan niet worden gerenderd: ${err.message}`
        );
      }

      res.json(
        engine === 'email'
          ? { subject: rendered.subject, html: rendered.body, mjml: body }
          : { subject: rendered.subject, text: rendered.body }
      );
    } catch (err) {
      next(err);
    }
  });

router
  .route('/styling')
  .get(auth.can('NotificationTemplate', 'list'))
  .get(async function (req, res, next) {
    try {
      const project = await db.Project.scope(
        'includeConfig',
        'includeEmailConfig'
      ).findByPk(req.params.projectId);
      if (!project) {
        throw createError(404, 'Project not found');
      }
      res.json(await mailStylingFor(project));
    } catch (err) {
      next(err);
    }
  });

router
  .route('/default/:type')
  .get(auth.can('NotificationTemplate', 'list'))
  .get(async function (req, res, next) {
    try {
      const template = await loadDefaultTemplate(req.params.type);
      if (!template) {
        throw createError(404, 'No default template for this type');
      }
      const hasFields = isContentType(req.params.type);
      res.json({
        type: req.params.type,
        subject: template.subject.trim(),
        body: template.body.trim(),
        content: hasFields ? template.content : null,
        fixedBlock: hasFields ? fixedBlockDescription(req.params.type) : null,
      });
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
