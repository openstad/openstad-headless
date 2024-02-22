const express = require('express');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const router = express.Router({mergeParams: true});
const createError = require('http-errors');

// scopes
// ------
router
  .all('*', function(req, res, next) {
    req.scope = [];
    return next();
  });

// list templates
// --------------
router.route('/')
  .get(auth.can('NotificationTemplate', 'list'))
	.get(function(req, res, next) {
    db.NotificationTemplate
			.scope(req.scope)
			.findAndCountAll({
        where: {
          projectId: req.params.projectId,
        }
      })
			.then( result => {
        req.results = result.rows;
        return next();
			})
			.catch(next);
	})
	.get(auth.useReqUser)
	.get(function(req, res, next) {
		res.json(req.results);
  })

// create template
// ---------------
  .post(auth.can('NotificationTemplate', 'create'))
	.post(auth.useReqUser)
	.post(function(req, res, next) {
    // validations
		return next();
	})
	.post(function(req, res, next) {
		let data = {
      ...req.body,
			projectId: req.params.projectId,
		}
		db.NotificationTemplate
			.authorizeData(data, 'create', req.user)
			.create(data)
			.then(result => {
				db.NotificationTemplate
					.findByPk(result.id)
					.then(function( notificationTemplate ) {
            req.results = notificationTemplate;
						return next();
					});

			})
			.catch(next);
	})
	.post(auth.useReqUser)
	.post(function(req, res, next) {
		res.json(req.results);
  })

// with one template
// -----------------
router.route('/:templateId(\\d+)')
	.all(function(req, res, next) {
		let templateId = parseInt(req.params.templateId) || 1;
		db.NotificationTemplate
			.scope(req.scope)
			.findOne({
				where: { id: templateId }
			})
			.then(found => {
				if ( !found ) throw new Error('NotificationTemplate not found');
		    req.results = found;
				next();
			})
			.catch(next);
	})
	.all(auth.useReqUser)

// view template
// -------------
	.get(auth.can('NotificationTemplate', 'view'))
	.get(function(req, res, next) {
		res.json(req.results);
	})

// update template
// ---------------
	.put(auth.useReqUser)
	.put(function(req, res, next) {
		let template = req.results;
    if (!( template && template.can && template.can('update') )) return next( new Error('You cannot update this notificationTemplate') );
		template
			.authorizeData(req.body, 'update')
			.update(req.body)
			.then(result => {
				req.results = result;
        return next();
			})
			.catch(next);
	})
	.put(auth.useReqUser)
	.put(function(req, res, next) {
		res.json(req.results);
  })

// delete template
// ---------------
	.delete(function(req, res, next) {
		let template = req.results;
    if (!( template && template.can && template.can('delete') )) return next( new Error('You cannot delete this notificationTemplate') );
		req.results
			.destroy()
			.then(() => {
				res.json({ "template": "deleted" });
			})
			.catch(next);
	})

module.exports = router;
