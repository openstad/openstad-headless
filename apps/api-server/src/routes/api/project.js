const express 				= require('express');
const config 					= require('config');
const fetch           = require('node-fetch');
const merge           = require('merge');
const Sequelize       = require('sequelize');
const db      				= require('../../db');
const auth 						= require('../../middleware/sequelize-authorization-middleware');
const pagination 			= require('../../middleware/pagination');
const searchResults 	= require('../../middleware/search-results-user');
// TODO-AUTH
const checkHostStatus = require('../../services/checkHostStatus')
const OAuthApi        = require('../../services/oauth-api');
const projectsWithIssues = require('../../services/projects-with-issues');
const authSettings = require('../../util/auth-settings');

let router = express.Router({mergeParams: true});

router.route('/')

// list projects
// ----------
	.get(auth.can('Project', 'list'))
	.get(pagination.init)
	.get(function(req, res, next) {

		const scope = ['withArea'];

		db.Project
			.scope(scope)
			.findAndCountAll({ offset: req.dbQuery.offset, limit: req.dbQuery.limit })
			.then( result => {
        req.results = result.rows;
        req.dbQuery.count = result.count;
        return next();
			})
			.catch(next);
	})
	.get(searchResults)
	.get(auth.useReqUser)
	.get(pagination.paginateResults)
	.get(function(req, res, next) {
    let records = req.results.records || req.results
		records.forEach((record, i) => {
      let project = record.toJSON()
			if (!( req.user && req.user.role && req.user.role == 'admin' )) {
        project.config = undefined;
			}
      records[i] = project;
    });
		res.json(req.results);
  })

// create project
// -----------
	.post(auth.can('Project', 'create'))
	.post(function(req, res, next) {
		db.Project
			.create(req.body)
			.then((result) => {
				req.results = result;
				next();
				//return checkHostStatus({id: result.id});
			})
			.catch(next)
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
        req.results = req.results.concat( result.rows );
        req.dbQuery.count += result.count;
        return next();
			})
			.catch(next);

	})
	.get(searchResults)
	.get(auth.useReqUser)
	.get(pagination.paginateResults)
	.get(function(req, res, next) {
    let records = req.results.records || req.results
		records.forEach((record, i) => {
      let project = record.toJSON()
			if (!( req.user && req.user.role && req.user.role == 'admin' )) {
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
	.all(function(req, res, next) {
		const projectId = req.params.projectId;
		let query = { where: { id: parseInt(projectId) } }
		db.Project
			.scope('withArea')
			.findOne(query)
			.then(found => {
				if ( !found ) throw new Error('Project not found');
				req.results = found;
				req.project = req.results; // middleware expects this to exist
				next();
			})
			.catch(next);
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
	.put(function(req, res, next) {
		const project = req.results;
    if (!( project && project.can && project.can('update') )) return next( new Error('You cannot update this project') );

		req.results
			.authorizeData(req.body, 'update')
			.update(req.body)
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
    // update certain parts of config to the oauth client
    // mainly styling settings are synched so in line with the CMS
    try {
      let providers = await authSettings.providers({ project: req.project });
      for (let provider of providers) {
        let authConfig = await authSettings.config({ project: req.results, useAuth: provider });
        let adapter = await authSettings.adapter({ authConfig });
        if (adapter.service.updateClient) {
          await adapter.service.updateClient({ authConfig, config: req.results.config });
        }
      }
      return next();
    } catch(err) {
      return next(err);
    }
	})
	.put(function (req, res, next) {
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


module.exports = router;
