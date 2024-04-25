const express = require('express');
const db      = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');

let router = express.Router({mergeParams: true});

router.route('/')

// list submissions
// --------------
	.get(auth.can('Submission', 'list'))
	.get(pagination.init)
	.get(function (req, res, next) {
		let where = {};
		req.scope = ['defaultScope'];
		
		if (req.query.filter || req.query.exclude) {
			req.scope.push({method: ['filter', JSON.parse(req.query.filter), req.query.exclude]});
		}

		if (req.params && req.params.projectId) {
			req.scope.push({method: ['forProjectId', req.params.projectId]});
		}

		db.Submission
			.scope(...req.scope)
			.findAndCountAll({where, offset: req.dbQuery.offset, limit: req.dbQuery.limit, order: req.dbQuery.order})
			.then(function (result) {
				req.results       = result.rows;
				req.dbQuery.count = result.count;
				return next();
			})
			.catch(next);
	})
	.get(auth.useReqUser)
  .get(searchInResults({}))
	.get(pagination.paginateResults)
	.get(function(req, res, next) {
		res.json(req.results);
  })

// create submission
// ---------------
  .post(auth.can('Submission', 'create'))
	.post(function(req, res, next) {
		const data = {
			submittedData     : req.body.submittedData,
			projectId      			: req.params.projectId,
			widgetId      			: req.body.widgetId || null,
			userId      			: req.user.id,
		};

		db.Submission
			.authorizeData(data, 'create', req.user)
			.create(data)
			.then(result => {
				res.json(result);
			})
	})

	// with one existing submission
	// --------------------------
	router.route('/:submissionId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})')
		.all(function(req, res, next) {
			var submissionId = req.params.submissionId;

			req.scope = ['defaultScope'];
			req.scope.push({method: ['forProjectId', req.params.projectId]});

		//	let where = { projectId }

			db.Submission
				.scope(...req.scope)
				.findOne({
				    where: {id: submissionId, projectId: req.params.projectId}
				})
				.then(found => {
					if ( !found ) throw new Error('Submission not found');
					req.results = found;
					next();
				})
				.catch(next);
		})

// view submission
// -------------
	.get(auth.can('Submission', 'view'))
	.get(auth.useReqUser)
	.get(function(req, res, next) {
		res.json(req.results);
	})

	// update submission
	// ---------------
	.put(auth.useReqUser)
		.put(function(req, res, next) {
		  var submission = req.results;
      if (!( submission && submission.can && submission.can('update') )) return next( new Error('You cannot update this submission') );
		  submission
				.update(req.body)
				.then(result => {
					res.json(result);
				})
				.catch(next);
		})

// delete submission
// ---------------
	.delete(auth.can('Submission', 'delete'))
	.delete(function(req, res, next) {
		req.results
			.destroy()
			.then(() => {
				res.json({ "submission": "deleted" });
			})
			.catch(next);
	})

module.exports = router;
