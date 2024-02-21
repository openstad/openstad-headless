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

// list notifications
// ------------------
router.route('/')
  .get(auth.can('Notification', 'list'))
	.get(function(req, res, next) {
    db.Notification
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

// create notification
// -------------------
  .post(auth.can('Notification', 'create'))
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
		db.Notification
			.authorizeData(data, 'create', req.user)
			.create(data)
			.then(result => {
				db.Notification
					.findByPk(result.id)
					.then(function( notification ) {
            req.results = notification;
						return next();
					});

			})
			.catch(next);
	})
	.post(auth.useReqUser)
	.post(function(req, res, next) {
		res.json(req.results);
  })

// with one notification
// ---------------------
router.route('/:notificationId(\\d+)')
	.all(function(req, res, next) {
		let notificationId = parseInt(req.params.notificationId) || 1;
		db.Notification
			.scope(req.scope)
			.findOne({
				where: { id: notificationId }
			})
			.then(found => {
				if ( !found ) throw new Error('Notification not found');
		    req.results = found;
				next();
			})
			.catch(next);
	})
	.all(auth.useReqUser)

// view notification
// -----------------
	.get(auth.can('Notification', 'view'))
	.get(function(req, res, next) {
		res.json(req.results);
	})

// update notification
// -------------------
	.put(auth.useReqUser)
	.put(function(req, res, next) {
		let notification = req.results;
    if (!( notification && notification.can && notification.can('update') )) return next( new Error('You cannot update this notification') );
		notification
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

// delete notification
// -------------------
	.delete(function(req, res, next) {
		let notification = req.results;
    if (!( notification && notification.can && notification.can('delete') )) return next( new Error('You cannot delete this notification') );
		req.results
			.destroy()
			.then(() => {
				res.json({ "notification": "deleted" });
			})
			.catch(next);
	})

module.exports = router;
