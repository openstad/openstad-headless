const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../../middleware/sequelize-authorization-middleware');
const db = require('../../db');
const sanitize = require('../../util/sanitize');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const getWidgetSettings = require('../widget/widget-settings');
router.all('*', function (req, res, next) {
  req.scope = [];
  return next();
});

// list widgets
// --------------
router
  .route('/')
  .all(function (req, res, next) {
    let { dbQuery } = req;
    dbQuery.where = {
      projectId: req.params.projectId,
      ...req.queryConditions,
    };
    db.Widget.scope(...req.scope)
      .findAndCountAll(dbQuery)
      .then(function (result) {
        const { rows } = result;
        req.results = rows;
        return next();
      })
      .catch(next);
  })

  // list
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    return res.json(req.results);
  })

  // Create widget
  .post(auth.useReqUser)
  .post(rateLimiter(), async function (req, res, next) {
    const widget = req.body;
    const projectId = req.params.projectId;
    // Get the project to generate default config
    const project = await db.Project.scope('includeAreas').findOne({
      where: { id: projectId },
    });

    if (!project) {
      return next(new Error('Project not found'));
    }

    // Get widget settings and generate default config
    const widgetSettings = getWidgetSettings();
    const widgetDefinition = widgetSettings[widget.type];

    if (!widgetDefinition) {
      return next(new Error('Invalid widget type'));
    }

    try {
      if (
        !!widgetDefinition.defaultConfig &&
        !widgetDefinition.defaultConfig.projectId
      ) {
        widgetDefinition.defaultConfig.projectId = projectId;
      }
    } catch (err) {
      console.log('Error setting projectId in defaultConfig', err);
    }

    const createdWidget = await db.Widget.create({
      projectId,
      description: widget.description,
      type: widget.type,
      config: widgetDefinition.defaultConfig || {},
    });

    return res.json(createdWidget);
  });

// Multiple widget routes
// -------------------------

// Delete multiple widgets
router
  .route('/delete')
  .delete(auth.useReqUser)
  .delete(rateLimiter(), async function (req, res, next) {
    let ids = req.body.ids;

    if (!ids || !Array.isArray(ids)) {
      return next(new Error('Invalid request: ids must be an array'));
    }

    ids = ids.filter((id) => Number.isInteger(id));
    if (ids.length === 0) {
      return next(new Error('Invalid request: no valid ids provided'));
    }

    try {
      const widgets = await db.Widget.scope(...req.scope).findAll({
        where: { id: ids },
      });

      if (widgets.length === 0) {
        return res
          .status(404)
          .json({ error: 'No widgets found for the provided IDs' });
      }

      for (const widget of widgets) {
        if (!widget.can || !widget.can('delete')) {
          return next(
            new Error(`You cannot delete widget with ID ${widget.id}`)
          );
        }
      }

      await db.Widget.destroy({
        where: { id: ids },
      });

      res.json({ message: 'Widgets deleted successfully' });
    } catch (error) {
      next(error);
    }
  });

// Duplicate multiple widgets
router
  .route('/duplicate')
  .post(auth.useReqUser)
  .post(rateLimiter(), async function (req, res, next) {
    let ids = req.body.ids;
    const projectId = req.params.projectId;

    if (!ids || !Array.isArray(ids)) {
      return next(new Error('Invalid request: ids must be an array'));
    }

    ids = ids.filter((id) => Number.isInteger(id));
    if (ids.length === 0) {
      return next(new Error('Invalid request: no valid ids provided'));
    }

    try {
      const widgets = await db.Widget.scope(...req.scope).findAll({
        where: { id: ids },
      });

      if (widgets.length === 0) {
        return res
          .status(404)
          .json({ error: 'No widgets found for the provided IDs' });
      }

      for (const widget of widgets) {
        if (!widget.can || !widget.can('create')) {
          return next(
            new Error(`You cannot duplicate widget with ID ${widget.id}`)
          );
        }
      }

      const duplicatedWidgets = await Promise.all(
        widgets.map((widget) => {
          return db.Widget.create({
            projectId,
            description: widget?.description || '',
            type: widget.type,
            config: widget?.config || '{}',
          });
        })
      );

      res.json(duplicatedWidgets);
    } catch (error) {
      next(error);
    }
  });

// one widget routes: get widget
// -------------------------
router
  .route('/:id') //(\\d+)
  .all(function (req, res, next) {
    const id = req.params.id;
    let query = { where: { id } };

    db.Widget.scope(...req.scope)
      .findOne(query)
      .then((found) => {
        if (!found) throw new Error('Widget not found');
        req.results = found;
        req.widget = req.results; // middleware expects this to exist
        next();
      })
      .catch(next);
  })

  .get(auth.useReqUser)
  .get(function (req, res, next) {
    const widget = req.widget;
    res.json(widget);
  })

  // Update widget
  .put(auth.useReqUser)
  .put(rateLimiter(), async function (req, res, next) {
    const widget = req.widget;
    const config = { ...widget.config, ...(req.body?.config || {}) };
    const description = req.body?.description ?? widget.description;
    const typesToSanitize = ['rawresource', 'resourceoverview'];

    if (config) {
      // sanitize rawInput by user

      if (typesToSanitize.includes(widget.dataValues.type)) {
        widget.dataValues.config.rawInput = sanitize.content(
          widget.dataValues.config.rawInput
        );
      }
      widget.update({ config, description }).then((result) => res.json(result));
    }
  })

  // delete widget
  // ---------
  .delete(auth.useReqUser)
  .delete(function (req, res, next) {
    const widget = req.results;
    if (!(widget && widget.can && widget.can('delete')))
      return next(new Error('You cannot delete this widget'));

    widget
      .destroy()
      .then(() => {
        res.json({ widget: 'deleted' });
      })
      .catch(next);
  });

module.exports = router;
