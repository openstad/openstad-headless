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

// list messages
// -------------
router.route('/')
  .get(auth.can('NotificationMessage', 'list'))
	.get(function(req, res, next) {
    db.NotificationMessage
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

// create message
// --------------
  .post(auth.can('NotificationMessage', 'create'))
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
		db.NotificationMessage
			.authorizeData(data, 'create', req.user)
			.create(data)
			.then(result => {
				db.NotificationMessage
					.findByPk(result.id)
					.then(function( notificationMessage ) {
            req.results = notificationMessage;
						return next();
					});

			})
			.catch(next);
	})
	.post(auth.useReqUser)
	.post(function(req, res, next) {
		res.json(req.results);
  })

// with one message
// ----------------
router.route('/:messageId(\\d+)')
	.all(function(req, res, next) {
		let messageId = parseInt(req.params.messageId) || 1;
		db.NotificationMessage
			.scope(req.scope)
			.findOne({
				where: { id: messageId }
			})
			.then(found => {
				if ( !found ) throw new Error('NotificationMessage not found');
		    req.results = found;
				next();
			})
			.catch(next);
	})
	.all(auth.useReqUser)

// view message
// ------------
	.get(auth.can('NotificationMessage', 'view'))
	.get(function(req, res, next) {
		res.json(req.results);
	})

// update message
// --------------
	.put(auth.useReqUser)
	.put(function(req, res, next) {
		let message = req.results;
    if (!( message && message.can && message.can('update') )) return next( new Error('You cannot update this notificationMessage') );
		message
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

// delete message
// --------------
	.delete(function(req, res, next) {
		let message = req.results;
    if (!( message && message.can && message.can('delete') )) return next( new Error('You cannot delete this notificationMessage') );
		req.results
			.destroy()
			.then(() => {
				res.json({ "message": "deleted" });
			})
			.catch(next);
	})

module.exports = router;
