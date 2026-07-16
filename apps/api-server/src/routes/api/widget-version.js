const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../../middleware/sequelize-authorization-middleware');
const db = require('../../db');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const createError = require('http-errors');
const { snapshotWidgetVersion } = require('../../services/widget-version');

router.all('*', function (req, res, next) {
  req.scope = [];
  return next();
});

// Load the widget for all version routes, scoped to the project
router.all('*', function (req, res, next) {
  const widgetId = req.params.widgetId;
  const projectId = req.params.projectId;

  db.Widget.scope(...req.scope)
    .findOne({ where: { id: widgetId, projectId } })
    .then((found) => {
      if (!found) {
        return next(createError(404, 'Widget not found'));
      }
      req.results = found;
      req.widget = found;
      return next();
    })
    .catch(next);
});

// List versions for a widget, newest first
router
  .route('/')
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    const widget = req.widget;
    if (!(widget.can && widget.can('update'))) {
      return next(
        createError(403, 'You cannot view the version history of this widget')
      );
    }

    db.WidgetVersion.findAll({
      where: { widgetId: widget.id },
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      attributes: [
        'id',
        'widgetId',
        'projectId',
        'userId',
        'userName',
        'name',
        'pinned',
        'createdAt',
      ],
      raw: true,
    })
      .then((versions) => res.json(versions))
      .catch(next);
  });

// Get a single version including its full config, or update its name/pinned state
router
  .route('/:versionId(\\d+)')
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    const widget = req.widget;
    if (!(widget.can && widget.can('update'))) {
      return next(
        createError(403, 'You cannot view the version history of this widget')
      );
    }

    db.WidgetVersion.findOne({
      where: { id: req.params.versionId, widgetId: widget.id },
      raw: true,
    })
      .then((version) => {
        if (!version) {
          return next(createError(404, 'Version not found'));
        }
        return res.json(version);
      })
      .catch(next);
  })

  .patch(auth.useReqUser)
  .patch(async function (req, res, next) {
    try {
      const widget = req.widget;
      if (!(widget.can && widget.can('update'))) {
        return next(createError(403, 'You cannot modify this version'));
      }

      const version = await db.WidgetVersion.findOne({
        where: { id: req.params.versionId, widgetId: widget.id },
      });

      if (!version) {
        return next(createError(404, 'Version not found'));
      }

      const updates = {};
      if (typeof req.body?.name === 'string') {
        updates.name = req.body.name.trim() || null;
      } else if (req.body?.name === null) {
        updates.name = null;
      }
      if (typeof req.body?.pinned === 'boolean') {
        updates.pinned = req.body.pinned;
      }

      if (Object.keys(updates).length === 0) {
        return next(createError(400, 'Nothing to update'));
      }

      await version.update(updates);

      return res.json({
        id: version.id,
        name: version.name,
        pinned: version.pinned,
      });
    } catch (err) {
      return next(err);
    }
  });

// Restore a previous version
router
  .route('/:versionId(\\d+)/restore')
  .post(auth.useReqUser)
  .post(rateLimiter(), async function (req, res, next) {
    try {
      const widget = req.widget;
      if (!(widget.can && widget.can('update'))) {
        return next(new Error('You cannot restore this widget'));
      }

      const version = await db.WidgetVersion.findOne({
        where: { id: req.params.versionId, widgetId: widget.id },
      });

      if (!version) {
        return next(createError(404, 'Version not found'));
      }

      const preRestoreLatest = await db.WidgetVersion.findOne({
        where: { widgetId: widget.id },
        order: [
          ['createdAt', 'DESC'],
          ['id', 'DESC'],
        ],
        attributes: ['id'],
        raw: true,
      });
      const undoVersionId = preRestoreLatest ? preRestoreLatest.id : null;

      const result = await widget.update({ config: version.config });
      await snapshotWidgetVersion(result, req.user);

      return res.json({ widget: result, undoVersionId });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;
