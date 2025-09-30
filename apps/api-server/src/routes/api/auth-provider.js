const express               = require('express');
const config                = require('config');
const fetch                 = require('node-fetch');
const merge                 = require('merge');
const Sequelize             = require('sequelize');
const db                    = require('../../db');
const auth                  = require('../../middleware/sequelize-authorization-middleware');
const pagination            = require('../../middleware/pagination');
const searchInResults       = require('../../middleware/search-in-results');
// TODO-AUTH
const checkHostStatus       = require('../../services/checkHostStatus');
const projectsWithIssues    = require('../../services/projects-with-issues');
const authSettings          = require('../../util/auth-settings');
const hasRole               = require('../../lib/sequelize-authorization/lib/hasRole');
const removeProtocolFromUrl = require('../../middleware/remove-protocol-from-url');
const messageStreaming      = require('../../services/message-streaming');
const service               = require('../../adapter/openstad/service');
const fs                    = require('fs');
const getWidgetSettings     = require('./../widget/widget-settings');
const widgetDefinitions     = getWidgetSettings();
const createError           = require('http-errors');

let router   = express.Router({ mergeParams: true });
const { Op } = require('sequelize');

router.route('/')
  
  // list auth providers
  // ----------
  .get(auth.can('AuthProvider', 'list'))
  .get(pagination.init)
  .get(function(req, res, next) {
    if (req.query.includeAuthConfig) return next('includeAuthConfig is not implemented for projects list');
    return next();
  })
  .get(async function(req, res, next) {
    try {
      // now find the corresponding projects
      let result        = await db.AuthProvider.findAndCountAll({ offset: req.dbQuery.offset, limit: req.dbQuery.limit });
      req.results       = result.rows;
      req.dbQuery.count = result.count;
      return next();
      
    } catch (err) {
      next(err);
    }
    
  })
  .get(auth.useReqUser)
  .get(pagination.paginateResults)
  .get(function(req, res, next) {
    res.json(req.results);
  })
  
  // Create widget
  .post(auth.useReqUser)
  .post(async function(req, res, next) {
    const provider = req.body;
    
    const createdProvider = await db.AuthProvider.create({
      name:   provider.name,
      type:   'oidc',
      config: provider.config,
    });
    
    return res.json({ id: createdProvider.id });
  });

// get specific auth provider
router.route('/:id', auth.can('AuthProvider', 'get'))
  .all(async function(req, res, next) {
    try {
      let result = await db.AuthProvider.findByPk(req.params.id);
      if (!result) return next(new createError(404, 'Auth provider not found'));
      req.results = result;
      return next();
    } catch (err) {
      next(err);
    }
  })
  .get(auth.useReqUser)
  .get(function(req, res, next) {
    res.json(req.results);
  })
  
  // update auth provider
  .put(async function(req, res, next) {
    const provider = req.results;
    const config   = merge.recursive(true, provider.config, req.body?.config);
    const name     = req.body?.name || provider.name;
    
    provider.update({ name, config }).then((result) => res.json(result));
  })
  
  // delete auth provider
  .delete(auth.useReqUser)
  .delete(function(req, res, next) {
    const provider = req.results;
    if (!(provider && provider.can && provider.can('delete')))
      return next(new Error('You cannot delete this Auth provider'));
    
    // Ensure the auth provider is not used in any project
    // Config is a json object, so we need to check if the id is in the config
    db.Project.findAll({
        where: Sequelize.literal(
            `JSON_CONTAINS(config->'$.authProviders', '${JSON.stringify([provider.id])}')`
        )
      })
      .then((project) => {
        if (project && project.length) {
          const ids = project.map((p) => p.id);
          return next(new createError(400, `Deze authenticatie provider wordt nog gebruikt in project: ${ids.join(', ')}.`));
        } else {
          provider
            .destroy()
            .then(() => {
              res.json({ provider: 'deleted' });
            });
        }
      })
      .catch(next);
    
    
  });
module.exports = router;
