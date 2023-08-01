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
const sitesWithIssues = require('../../services/sites-with-issues');

let router = express.Router({mergeParams: true});

const refreshSiteConfigMw = function (req, res, next) {
	const site = req.results;

	// assume https, wont work for some dev environments
	const cmsUrl = site.config.cms &&  site.config.cms.url ?  site.config.cms.url : 'https://' + site.domain;

	if (!cmsUrl) {
		next();
	}

	return next();

}

router.route('/')

// list sites
// ----------
	.get(auth.can('Site', 'list'))
	.get(pagination.init)
	.get(function(req, res, next) {

		const scope = ['withArea'];

		db.Site
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
      let site = record.toJSON()
			if (!( req.user && req.user.role && req.user.role == 'admin' )) {
        site.config = undefined;
			}
      records[i] = site;
    });
		res.json(req.results);
  })

// create site
// -----------
	.post(auth.can('Site', 'create'))
	.post(function(req, res, next) {
		db.Site
			.create(req.body)
			.then((result) => {
				req.results = result;
				next();
				//return checkHostStatus({id: result.id});
			})
			.catch(next)
	})
	.post(auth.useReqUser)
	.post(refreshSiteConfigMw)
	.post(function(req, res, next) {
    return res.json(req.results);
  })

// list sites with issues
router.route('/issues')
// -------------------------------
	.get(auth.can('Site', 'list'))
	.get(pagination.init)
	.get(function(req, res, next) {
    req.results = [];
    req.dbQuery.count = 0;
    return next();
  })
	.get(function(req, res, next) {

    // sites that should be ended but are not
    sitesWithIssues.shouldHaveEndedButAreNot({ offset: req.dbQuery.offset, limit: req.dbQuery.limit })
			.then( result => {
        req.results = req.results.concat( result.rows );
        req.dbQuery.count += result.count;
        return next();
			})
			.catch(next);

	})
	.get(function(req, res, next) {

    // sites that have ended but are not anonymized
    sitesWithIssues.endedButNotAnonymized({ offset: req.dbQuery.offset, limit: req.dbQuery.limit })
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
      let site = record.toJSON()
			if (!( req.user && req.user.role && req.user.role == 'admin' )) {
        site.config = undefined;
			}
      records[i] = site;
    });
		res.json(req.results);
  })

// one site routes: get site
// -------------------------
router.route('/:siteIdOrDomain') //(\\d+)
	.all(auth.can('Site', 'view'))
	.all(function(req, res, next) {
		const siteIdOrDomain = req.params.siteIdOrDomain;
		let query;

		if (isNaN(siteIdOrDomain)) {
			query = {	where: { domain: siteIdOrDomain } }
		} else {
			query = { where: { id: parseInt(siteIdOrDomain) } }
		}

		db.Site
			.scope('withArea')
			.findOne(query)
			.then(found => {
				if ( !found ) throw new Error('Site not found');
				req.results = found;
				req.site = req.results; // middleware expects this to exist
				next();
			})
			.catch(next);
	})

// view site
// ---------
	.get(auth.can('Site', 'view'))
	.get(auth.useReqUser)
	.get(function(req, res, next) {
		res.json(req.results);
	})

// update site
// -----------
	.put(auth.useReqUser)
	.put(function(req, res, next) {
		const site = req.results;
    if (!( site && site.can && site.can('update') )) return next( new Error('You cannot update this site') );

		req.results
			.authorizeData(req.body, 'update')
			.update(req.body)
			.then(result => {
				return checkHostStatus({id: result.id});
			})
			.then(() => {
				next();
        return null;
			})
			.catch((err) => {
				console.log('ERROR',err);
				next();
        return null;
			});
	})
// update certain parts of config to the oauth client
// mainly styling settings are synched so in line with the CMS
	.put(function (req, res, next) {

    req.siteOAuthClients = [];
    const site          = req.site;
    const authServerUrl = config.authorization['auth-server-url'];

    const siteConfig = req.site && req.site.config
    const oauthConfig  = siteConfig.oauth;
    
    const fetchActions = [];
    const fetchClient = (req, which) => {
      return new Promise((resolve, reject) => {
        return OAuthApi
          .fetchClient({ siteConfig, which })
          .then((client) => {
            if (client && client.id) req.siteOAuthClients.push(client);
            resolve();
          })
          .catch((err) => {
            console.log('==>> err oauthClientId', which, err.message);
            resolve();
          });
      })
    }

    if (oauthConfig && Object.keys(oauthConfig).length > 0) {
      Object.keys(oauthConfig).forEach((configKey) => {
        fetchActions.push(fetchClient(req, configKey));
      })
    } else {
      let which = req.query.useOauth || 'default';
      fetchActions.push(fetchClient(req, which));
    }

    return Promise
      .all(fetchActions)
      .then(() => { next(); })
      .catch((e) => {
        console.log('eeee', e)
        next();
      });
	})
	.put(function (req, res, next) {

    // todo: gebruik de oauth-api service
		const authServerUrl = config.authorization['auth-server-url'];
		const updates = [];

		req.siteOAuthClients.forEach((oauthClient, i) => {
			const authUpdateUrl = authServerUrl + '/api/admin/client/' + oauthClient.id;
			const configKeysToSync = ['users', 'styling', 'ideas'];

      // todo: gebruik de oauth-api service
      // todo: specifieker selecteren van sync velden (user.canCreateNewUsers)
      // todo: ik denk dat dit in het model moet    

			oauthClient.config = oauthClient.config ? oauthClient.config : {};

			configKeysToSync.forEach(field => {
				oauthClient.config[field] = req.site.config[field];
			});
      oauthClient.config['users'] = { canCreateNewUsers: req.site.config.users.canCreateNewUsers }


      const apiCredentials = {
				client_id: oauthClient.clientId,
				client_secret: oauthClient.clientSecret,
			}

			const options = {
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors',
				body: JSON.stringify(Object.assign(apiCredentials, oauthClient))
			}

			updates.push(fetch(authUpdateUrl, options));
		});

		Promise.all(updates)
			.then(() => {
				next()
			})
			.catch((e) => {
				console.log('errr oauth', e);
				next(e)
			});
	})
// call the site, to let the site know a refresh of the siteConfig is needed
	.put(function (req, res, next) {
		// when succesfull return site JSON
		res.json(req.results);
    next();
	})
	.put(refreshSiteConfigMw) // after response; no need to wait for this
	.put(function (req, res, next) {
    // the end
	})

// delete site
// ---------
	.delete(auth.can('Site', 'delete'))
	.delete(function(req, res, next) {
		req.results
			.destroy()
			.then(() => {
				res.json({ "site": "deleted" });
			})
			.catch(next);
	})

// anonymize all users
// -------------------
router.route('/:siteId(\\d+)/:willOrDo(will|do)-anonymize-all-users')
	.put(auth.can('Site', 'anonymizeAllUsers'))
	.put(function(req, res, next) {
    // the site
		let where = { id: parseInt(req.params.siteId) };
		db.Site
			.findOne({ where })
			.then(found => {
				if ( !found ) throw new Error('Site not found');
				req.results = found;
				req.site = req.results; // middleware expects this to exist
        		next();
			})
			.catch(next);
	})
  .put(async function (req, res, next) {
    try {
		const result = await req.site.willAnonymizeAllUsers();
		req.results = result;
      if (req.params.willOrDo == 'do') {
		result.message = 'Ok';

		req.site.doAnonymizeAllUsers(
			[...result.users], 
			[...result.externalUserIds],
			req.query.useOauth

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
