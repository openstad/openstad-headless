const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../../middleware/sequelize-authorization-middleware');
const db = require('../../db');
const sanitize = require('../../util/sanitize');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const getWidgetSettings = require('../widget/widget-settings');
const createError = require('http-errors');
const { snapshotWidgetVersion } = require('../../services/widget-version');
const {
  canUserUseSourceProjectForDuplication,
  canUserWriteToProject,
  remapWidgetConfigForProject,
  buildTargetMaps,
} = require('../../util/widget-copy');
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

    let widgetConfig = {};
    try {
      // Clone to avoid mutating the shared widget definition object.
      widgetConfig = JSON.parse(
        JSON.stringify(widgetDefinition.defaultConfig || {})
      );
      if (widgetConfig && typeof widgetConfig === 'object') {
        widgetConfig.projectId = projectId;
      }
    } catch (err) {
      console.log('Error generating widget config', err);
    }

    const createdWidget = await db.Widget.create({
      projectId,
      description: widget.description,
      type: widget.type,
      config: widgetConfig,
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

// Copy widgets from another project into this one
router
  .route('/copy')
  .post(auth.useReqUser)
  .post(rateLimiter(), async function (req, res, next) {
    const targetProjectId = parseInt(req.params.projectId, 10);
    const sourceProjectId = parseInt(req.body.sourceProjectId, 10);
    let ids = req.body.ids;

    // `>= 1`, not just an integer: the permission check treats a falsy source
    // project as "no source project" and returns true, so 0 would skip it.
    if (!Number.isInteger(sourceProjectId) || sourceProjectId < 1) {
      return next(
        createError(
          400,
          'Invalid request: sourceProjectId must be a positive integer'
        )
      );
    }
    if (sourceProjectId === targetProjectId) {
      return next(
        createError(
          400,
          'Invalid request: sourceProjectId must differ from the target project'
        )
      );
    }
    if (!ids || !Array.isArray(ids)) {
      return next(createError(400, 'Invalid request: ids must be an array'));
    }
    ids = ids.filter((id) => Number.isInteger(id));
    if (ids.length === 0) {
      return next(createError(400, 'Invalid request: no valid ids provided'));
    }

    try {
      const canUseSourceProject = await canUserUseSourceProjectForDuplication({
        user: req.user,
        sourceProjectId,
      });
      if (!canUseSourceProject) {
        return next(
          createError(
            403,
            'Not allowed to copy widgets from this source project'
          )
        );
      }

      const canWriteToTargetProject = await canUserWriteToProject({
        user: req.user,
        targetProjectId,
      });
      if (!canWriteToTargetProject) {
        return next(
          createError(403, 'Not allowed to copy widgets into this project')
        );
      }

      const sourceWidgets = await db.Widget.findAll({
        where: { id: ids, projectId: sourceProjectId },
      });

      if (sourceWidgets.length === 0) {
        return next(
          createError(
            404,
            'No widgets found for the provided IDs in the source project'
          )
        );
      }

      for (const widget of sourceWidgets) {
        // Pass req.user explicitly. Assigning widget.auth.user instead would
        // mutate Widget.prototype.auth -- the object every Widget instance
        // shares -- and leak this user into later requests.
        if (!widget.can || !widget.can('create', req.user)) {
          return next(
            createError(403, `You cannot copy widget with ID ${widget.id}`)
          );
        }
      }

      const { tagMap, statusMap, markerSetMap } = await buildTargetMaps(
        sourceProjectId,
        targetProjectId
      );

      // Both passes run in one transaction: pass 1 stores the source config
      // verbatim, so a failure in pass 2 would otherwise leave widgets behind
      // that still point at the source project's tags, statuses and widgets.
      const newWidgets = await db.sequelize.transaction(async (transaction) => {
        // Pass 1: create the copies so widget-to-widget references between
        // two widgets copied in the same batch can be remapped in pass 2.
        const widgetMap = {};
        const created = [];
        for (const widget of sourceWidgets) {
          const newWidget = await db.Widget.create(
            {
              projectId: targetProjectId,
              description: widget.description,
              type: widget.type,
              config: widget.config || {},
            },
            { transaction }
          );
          widgetMap[widget.id] = newWidget.id;
          created.push(newWidget);
        }

        // Pass 2: remap project-specific references in each copy's config.
        for (const newWidget of created) {
          const config = JSON.parse(JSON.stringify(newWidget.config || {}));
          const { clearedKeys } = remapWidgetConfigForProject(config, {
            widgetMap,
            // No resourceMap: resources are not copied, so resourceId is cleared.
            resourceMap: {},
            tagMap,
            statusMap,
            markerSetMap,
            projectId: targetProjectId,
          });
          config.projectId = targetProjectId;
          await newWidget.update({ config }, { transaction });

          // Logged, not silent: a cleared reference is a visible difference
          // between the source widget and its copy.
          if (clearedKeys.length) {
            console.log(
              `[widget-copy] widget ${newWidget.id}: cleared ${clearedKeys.join(
                ', '
              )} (no equivalent in project ${targetProjectId})`
            );
          }
        }

        return created;
      });

      res.json(newWidgets);
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
        if (!found) {
          return next(createError(404, 'Widget not found'));
        }
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

  .put(auth.useReqUser)
  .put(rateLimiter(), async function (req, res, next) {
    try {
      const widget = req.widget;
      const config = { ...widget.config, ...(req.body?.config || {}) };
      const description = req.body?.description ?? widget.description;
      const typesToSanitize = ['rawresource', 'resourceoverview'];

      if (
        typesToSanitize.includes(widget.dataValues.type) &&
        config.rawInput !== undefined
      ) {
        config.rawInput = sanitize.content(config.rawInput);
      }

      const result = await db.sequelize.transaction(async (transaction) => {
        const updated = await widget.update(
          { config, description },
          { transaction }
        );
        await snapshotWidgetVersion(updated, req.user, {}, { transaction });
        return updated;
      });

      return res.json(result);
    } catch (err) {
      return next(err);
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
