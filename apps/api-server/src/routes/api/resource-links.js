const express = require('express');
const createError = require('http-errors');
const db = require('../../db');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const resourceLinks = require('../../services/resource-links');
const pluginExtensions = require('../../services/plugin-extensions');

const router = express.Router({ mergeParams: true });

router.use(async function (req, res, next) {
  try {
    const resourceId = parseInt(req.params.resourceId, 10);
    const projectId = parseInt(req.params.projectId, 10);
    const resource = await db.Resource.scope('defaultScope', {
      method: ['onlyVisible', req.user.id, req.user.role],
    }).findOne({
      where: { id: resourceId, projectId },
    });
    if (!resource) {
      return next(createError(404, 'Resource not found'));
    }
    req.linkContext = { projectId, resourceId };
    req.linkResource = resource;
    next();
  } catch (err) {
    next(err);
  }
});

function requireEditor(req, res, next) {
  if (!hasRole(req.user, 'editor')) {
    return next(createError(403, 'You cannot manage links'));
  }
  next();
}

router.get('/', async function (req, res, next) {
  try {
    const links = await resourceLinks.listLinks({
      ...req.linkContext,
      user: req.user,
    });
    res.json(links);
  } catch (err) {
    next(err);
  }
});

router.get('/selection', async function (req, res, next) {
  try {
    if (!req.linkResource.can('update', req.user)) {
      throw createError(403, 'You cannot view the link selection');
    }
    const handler = pluginExtensions.get().getLinkRequestHandler();
    const [links, pending] = await Promise.all([
      resourceLinks.listLinks({ ...req.linkContext, user: req.user }),
      handler
        ? handler.getPendingSelection({
            project: req.project,
            resource: req.linkResource,
            user: req.user,
          })
        : [],
    ]);
    res.json({ links, pending });
  } catch (err) {
    next(err);
  }
});

router.post('/', rateLimiter(), requireEditor, async function (req, res, next) {
  try {
    const link = await resourceLinks.createLink({
      ...req.linkContext,
      targetSource: req.body.targetSource,
      targetId: req.body.targetId,
    });
    res.json(link);
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/:linkId(\\d+)',
  rateLimiter(),
  requireEditor,
  async function (req, res, next) {
    try {
      await resourceLinks.removeLink({
        ...req.linkContext,
        linkId: parseInt(req.params.linkId, 10),
      });
      res.json({ link: 'deleted' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
