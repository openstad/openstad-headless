const express 				= require('express');
const config 					= require('config');
const fetch           = require('node-fetch');
const merge           = require('merge');
const Sequelize       = require('sequelize');
const db      				= require('../../db');
const auth 						= require('../../middleware/sequelize-authorization-middleware');
const pagination 			= require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
// TODO-AUTH
const checkHostStatus = require('../../services/checkHostStatus')
const projectsWithIssues = require('../../services/projects-with-issues');
const authSettings = require('../../util/auth-settings');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const removeProtocolFromUrl = require('../../middleware/remove-protocol-from-url');
const messageStreaming = require('../../services/message-streaming');
const service = require('../../adapter/openstad/service');
const fs = require('fs');
const getWidgetSettings = require('./../widget/widget-settings');
const widgetDefinitions = getWidgetSettings();
const createError = require('http-errors');

let router = express.Router({mergeParams: true});

async function getProject(req, res, next, include = []) {
	const projectId = req.params.projectId;
	let query = { where: { id: parseInt(projectId) }, include: include };
  try {
    let project = await db.Project.scope(req.scope).findOne(query);
		if ( !project ) throw new Error('Project not found');
		req.results = project;
		req.project = req.results; // middleware expects this to exist
    // include authconfig
    if (req.query.includeAuthConfig && hasRole( req.user, 'admin')) {
      let providers = await authSettings.providers({ project });
      for (let provider of providers) {
        if ( provider == 'default' ) continue;
        let authConfig = await authSettings.config({ project, useAuth: provider });
        let adapter = await authSettings.adapter({ authConfig });
        if (adapter.service.fetchClient) {
          let client = await adapter.service.fetchClient({authConfig, project})
          project.config.auth.provider[provider].name = client.name;
          project.config.auth.provider[provider].description = client.description;
          project.config.auth.provider[provider].siteUrl = client.siteUrl;
          project.config.auth.provider[provider].authTypes = client.authTypes;
          project.config.auth.provider[provider].requiredUserFields = client.requiredUserFields;
          project.config.auth.provider[provider].twoFactorRoles = client.twoFactorRoles;
          project.config.auth.provider[provider].allowedDomains = client.allowedDomains;
          project.config.auth.provider[provider].config = client.config;
          project.config.auth.provider[provider].client = client;
        }
      }
    }
    return next();
  } catch(err) {
    return next(err);
  }
}

// scopes
// ------
router
  .all('*', function(req, res, next) {

    req.scope = ['excludeEmailConfig'];

    if (!req.query.includeConfig && !req.query.includeAuthConfig) {
      req.scope.push('excludeConfig');
    }

    if (req.query.includeEmailConfig) {
      req.scope.push('includeEmailConfig');
    }

    if (req.query.includeAreas) {
      req.scope.push('includeAreas');
    }

    return next();

  });

router.route('/')

// list projects
// ----------
	.get(auth.can('Project', 'list'))
	.get(pagination.init)
	.get(function(req, res, next) {
    if (req.query.includeAuthConfig) return next('includeAuthConfig is not implemented for projects list')
    return next();
	})
	.get(async function(req, res, next) {

    try {
      let where = {};
      if (!hasRole( req.user, 'superuser' )) {
        // first find all corresponding users for the current user, only where she is admin
        let users = await db.User.findAll({
          where: {
            idpUser: {
              identifier: req.user?.idpUser?.identifier || 'no identifier found',
              provider: req.user?.idpUser?.provider || 'no provider found',
            },
            role: 'admin',
          }
        })
        let projectIds = users.map(u => u.projectId);
        where = { id : projectIds };
      }

      // now find the corresponding projects
      let result = await db.Project.scope(req.scope).findAndCountAll({ offset: req.dbQuery.offset, limit: req.dbQuery.limit, where })
      req.results = result.rows;
      req.dbQuery.count = result.count;
      return next();

    } catch(err) {
      next(err)
    }


	})
  .get(searchInResults({ searchfields: ['name', 'title'] }))
	.get(auth.useReqUser)
	.get(pagination.paginateResults)
	.get(function(req, res, next) {
    let records = req.results.records || req.results
		records.forEach((record, i) => {
      // todo: waarom is dit? dat zou door het auth systeem moeten worden afgevangen
      let project = record.toJSON()
			if (!( req.user && hasRole( req.user, 'admin') )) {
        project.config = undefined;
        project.safeConfig = undefined;
			}
      records[i] = project;
    });
		res.json(req.results);
  })

// create project
// -----------
	.post(auth.can('Project', 'create'))
	.post(removeProtocolFromUrl)
	.post(async function (req, res, next) {
    // create an oauth client if nessecary
    let project = {
      config: req.body.config || {}
    };
    try {
      let providers = await authSettings.providers({ project, useOnlyDefinedOnProject: true });
      let providersDone = [];
      for (let provider of providers) {
        let authConfig = await authSettings.config({ project, useAuth: provider });
        if ( !providersDone[authConfig.provider] ) { // filter for duplicates like 'default'
          let adapter = await authSettings.adapter({ authConfig });
          if (adapter.service.createClient) {
            let client = await adapter.service.createClient({ authConfig, project });
            project.config.auth.provider[authConfig.provider] = project.config.auth.provider[authConfig.provider] || {};
            project.config.auth.provider[authConfig.provider].clientId = client.clientId;
            project.config.auth.provider[authConfig.provider].clientSecret = client.clientSecret;
            delete project.config.auth.provider[authConfig.provider].authTypes;
            delete project.config.auth.provider[authConfig.provider].twoFactorRoles;
            delete project.config.auth.provider[authConfig.provider].requiredUserFields;
          }
          providersDone[authConfig.provider] = true;
        }
      }
      if (Object.keys(providersDone).length) {
        req.body.config.auth = project.config.auth;
      }
      return next();
    } catch(err) {
      return next(err);
    }
	})
	.post(function(req, res, next) {
		db.Project
			.create({ emailConfig: {}, ...req.body })
			.then(result => {
        req.results = result;

				return checkHostStatus({id: result.id});
			})
			.then(() => {
				next();
        return null;
			})
			.catch(next)
	})
	.post(async function (req, res, next) {
    let publisher = await messageStreaming.getPublisher();
    if (publisher) {
      publisher.publish('new-project', 'event');
    } else {
      console.log('No publisher found')
    }
    return next()
	})
	.post(auth.useReqUser)
	.post(function(req, res, next) {
    return res.json(req.results);
  })

// list projects with issues
router.route('/issues')
// -------------------------------
	.get(auth.can('Project', 'list'))
	.get(pagination.init)
	.get(function(req, res, next) {
    req.results = [];
    req.dbQuery.count = 0;
    return next();
  })
	.get(function(req, res, next) {

    // projects that should be ended but are not
    projectsWithIssues.shouldHaveEndedButAreNot({ offset: req.dbQuery.offset, limit: req.dbQuery.limit })
			.then( result => {
        req.results = req.results.concat( result.rows );
        req.dbQuery.count += result.count;
        return next();
			})
			.catch(next);

	})
	.get(function(req, res, next) {

    // projects that have ended but are not anonymized
    projectsWithIssues.endedButNotAnonymized({ offset: req.dbQuery.offset, limit: req.dbQuery.limit })
			.then( result => {
        // zie module: deze query is een findAll ipv findAndCountAll
        // req.results = req.results.concat( result.rows );
        // req.dbQuery.count += result.count;
        req.results = req.results.concat( result );
        req.dbQuery.count += result.length;
        return next();
			})
			.catch(next);

	})
  .get(searchInResults({ searchfields: ['name', 'title'] }))
	.get(auth.useReqUser)
	.get(pagination.paginateResults)
	.get(function(req, res, next) {
    let records = req.results.records || req.results
		records.forEach((record, i) => {
      let project = record.toJSON()
			if (!( req.user && hasRole( req.user, 'admin') )) {
        project.config = undefined;
			}
      records[i] = project;
    });
		res.json(req.results);
  })

// one project routes: get project
// -------------------------
router.route('/:projectId') //(\\d+)
	.all(auth.can('Project', 'view'))
	.all(async function(req, res, next) {
		await getProject(req, res, next)
	})


// view project
// ---------
	.get(auth.can('Project', 'view'))
	.get(auth.useReqUser)
	.get(function(req, res, next) {
		res.json(req.results);
	})

// update project
// -----------
	.put(auth.useReqUser)
	.put(removeProtocolFromUrl)
	.put(async function (req, res, next) {
    // update certain parts of config to the oauth client
		const project = await db.Project.findOne({ where: { id: req.results.id} });
    if (!hasRole( req.user, 'admin')) return next();
    try {
      let providers = await authSettings.providers({ project });
      for (let provider of providers) {
        let authData = req.body.config?.auth?.provider?.[provider];
        if (!authData) continue;
        let authConfig = await authSettings.config({ project, useAuth: provider });
        let adapter = await authSettings.adapter({ authConfig });
        if (adapter.service.updateClient) {
          let merged = merge.recursive({}, authConfig, req.body.config?.auth?.provider?.[authConfig.provider])
          await adapter.service.updateClient({ authConfig: merged, project });
          delete req.body.config?.auth?.provider?.[authConfig.provider]?.authTypes;
          delete req.body.config?.auth?.provider?.[authConfig.provider]?.twoFactorRoles;
          delete req.body.config?.auth?.provider?.[authConfig.provider]?.requiredUserFields;
          delete req.body.config?.auth?.provider?.[authConfig.provider]?.config;
        }
      }
      return next();
    } catch(err) {
      return next(err);
    }
	})
	.put(async function(req, res, next) {
		const project = await db.Project.findOne({ where: { id: req.results.id} });
    if (!( project && project.can && project.can('update') )) return next( new Error('You cannot update this project') );

    req.pendingMessages = [{ key: `project-${project.id}-update`, value: 'event' }];
    if (req.body.url && req.body.url != project.url) req.pendingMessages.push({ key: `project-urls-update`, value: 'event' });

    // Update allowedDomains if creating a new site
    let updateBody = req.body;
    const hasInitDomain = (project?.config?.allowedDomains !== undefined && project.config.allowedDomains.length === 1 && project.config.allowedDomains[0] == 'api.openstad.org');
    if((((project?.config?.allowedDomains || []).length === 0) || hasInitDomain) && req?.body?.url){
      // Check if url has protocol
      let reqUrl = req.body.url
      if(!reqUrl.includes('http://') && !reqUrl.includes('https://')){
        reqUrl = 'http://' + reqUrl;
      }
      let url = new URL(reqUrl);
      let host = url.host;

      updateBody.config = updateBody.config || {};
      updateBody.config.allowedDomains = [host];

      // Update client (auth-db)
      let adminAuthConfig = await authSettings.config({ project: project });
      service.updateClient({
        authConfig: adminAuthConfig,
        project: updateBody
      })
    }

    project
			.authorizeData(req.body, 'update')
			.update(updateBody)
			.then(result => {
        req.results = result;
				return checkHostStatus({id: result.id});
			})
			.then(() => {
				next();
        return null;
			})
			.catch((err) => {
				console.log('Ignore checkHostStatus error',err);
				next();
        return null;
			});
	})
	.put(async function (req, res, next) {
    if (!req.pendingMessages) return next();
    let publisher = await messageStreaming.getPublisher();
    if (publisher) {
      req.pendingMessages.map(message => {
        console.log('Message:', message.key, message.value);
        publisher.publish(message.key, message.value);
      });
    } else {
      console.log('No publisher found')
    }
    return next()
	})
	.put(async function (req, res, next) {
    // Check if updating allowedDomains
    if(typeof req?.results?.config?.allowedDomains !==  "undefined"){
      let proj = req.results.dataValues;

      // Check if allowedDomains exists
      if(typeof req?.results?.config?.allowedDomains !==  "undefined" && req.results.config.allowedDomains.length > 0){
        proj.config.allowedDomains = req.results.config.allowedDomains;
      }
    }

		// when succesfull return project JSON
		res.json(req.results);
	})

// delete project
// ---------
	.delete(auth.can('Project', 'delete'))
	.delete(function(req, res, next) {
		req.results
			.destroy()
			.then(() => {
				res.json({ "project": "deleted" });
			})
			.catch(next);
	})

// export a project
// -------------------
router.route('/:projectId(\\d+)/export')
	.all(auth.can('Project', 'view'))
	.all(async function(req, res, next) {
		await getProject(req, res, next, [{model: db.Resource, include: [{model: db.Tag}, {model: db.Vote}, {model: db.Comment, as: 'commentsFor'}, {model: db.Comment, as: 'commentsAgainst'}, {model: db.Comment, as: 'commentsNoSentiment'}, {model: db.Poll, as: 'poll'}]}, {model: db.Tag}, {model: db.Status}])
	})

	.get(auth.can('Project', 'view'))
	.get(auth.useReqUser)
	.get(function(req, res, next) {
		res.json(req.results);
	})

// anonymize all users
// -------------------
router.route('/:projectId(\\d+)/:willOrDo(will|do)-anonymize-all-users')
	.put(auth.can('Project', 'anonymizeAllUsers'))
	.put(function(req, res, next) {
    // the project
		let where = { id: parseInt(req.params.projectId) };
		db.Project
			.findOne({ where })
			.then(found => {
				if ( !found ) throw new Error('Project not found');
				req.results = found;
				req.project = req.results; // middleware expects this to exist
        		next();
			})
			.catch(next);
	})
  .put(async function (req, res, next) {
    try {
		const result = await req.project.willAnonymizeAllUsers();
		req.results = result;
      if (req.params.willOrDo == 'do') {
		result.message = 'Ok';

		req.project.doAnonymizeAllUsers(
			[...result.users],
			[...result.externalUserIds],
			req.query.useAuth

		);
      }
      next();
    } catch (err) {
      return next(err);
    }
  })
  .put(function (req, res, next) {
    // customized version of auth.useReqUser
    delete req.results.externalUserIds
		Object.keys(req.results).forEach(which => {
			req.results[which] && req.results[which].forEach && req.results[which].forEach( result => {
				if (typeof result == 'object') {
					result.auth = result.auth || {};
					result.auth.user = req.user;
				}
			});
		});
    return next();
  })
  .put(function (req, res, next) {
    res.json(req.results);
  })

router.route('/:projectId(\\d+)/css/:componentId?')
  .get(function (req, res, next) {
    let css = req.project?.config?.project?.cssCustom || '';
    
    if (req.params.componentId) {
      css += `\n\n#${req.params.componentId} { width: 100%; height: 100%; }`
    }
    
    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  });

router.route('/:projectId(\\d+)/widget-css/:widgetType')
  .get(function (req, res, next) {
    if (!req.params.widgetType) return next(createError(400, 'Invalid widget type given for fetching settings'));
    
    let widgetSettings = widgetDefinitions[req.params.widgetType];

    if (!widgetSettings) {
      return next(
        createError(400, 'Invalid widget type given for fetching settings')
      );
    }
    
    let css = '';
    
    widgetSettings.css.forEach((file) => {
      css += fs.readFileSync(require.resolve(`${widgetSettings.packageName}/${file}`), 'utf8');
    });
    
    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  });


module.exports = router;
