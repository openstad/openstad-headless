const express = require('express');
const createError = require('http-errors');
const db = require('../../db');
const auth= require('../../middleware/sequelize-authorization-middleware');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const pagination = require("../../middleware/pagination");
const searchInResults = require("../../middleware/search-in-results");

const router = express.Router({ mergeParams: true });

// ================================================================================
// choicesguide results
// ================================================================================

router.route('/:choicesGuideId(\\d+)(/questiongroup/:questionGroupId(\\d+))?/result$')
  .all(function(req, res, next) {
    req.scope = [{ method: ['forProjectId', req.project.id] }];
    return next();
  })
  .all(function(req, res, next) {
    let choicesGuideId = parseInt(req.params.choicesGuideId);
    if (!choicesGuideId) throw createError(404, 'choicesGuide not found');
    db.ChoicesGuide
      .scope(...req.scope)
      .findOne({
        where: { id: choicesGuideId, projectId: req.project.id }
      })
      .then((found) => {
        if ( !found ) throw createError(404, 'choicesGuide not found');
        found.project = req.project
        req.choicesguide = found;
        next();
      })
      .catch(next);
  })

// list results
// ------------

	.get(auth.can('ChoicesGuideResult', 'list'))
	.get(auth.useReqUser)
	.get(function(req, res, next) {
		let where = { choicesGuideId: req.choicesguide.id };
		let choicesGuideQuestionGroupId = parseInt(req.params.choicesGuideQuestionGroupId);
		if (choicesGuideQuestionGroupId) where.questionGroupId = choicesGuideQuestionGroupId;
		db.ChoicesGuideResult
			.scope(...req.scope)
			.findAll({ where })
			.then( (found) => {
				return found.map( (entry) => {
					let json = {
						id: entry.id,
						userId: entry.id,
						extraData: entry.extraData,
						userFingerprint: entry.userFingerprint,
						result: entry.result,
						createdAt: entry.createdAt,
						updatedAt: entry.updatedAt,
					};
					return json;
				});
			})
			.then(function( found ) {
				res.json(found);
			})
			.catch(next);
	});

router.route('/')
	// list choicesguide result
	// --------------

	.get(auth.can('ChoicesGuideResult', 'list'))
	.get(auth.useReqUser)
	.get(async function(req, res, next) {
		let where = {};
		req.scope = ['defaultScope'];

		if (req.params && req.params.projectId) {
			req.scope.push({method: ['forProjectId', req.params.projectId]});
		}

		try {
			const result = await db.ChoicesGuideResult
				.scope(...req.scope)
				.findAndCountAll({where, offset: req.dbQuery.offset, limit: req.dbQuery.limit, order: req.dbQuery.order});

			req.results = await Promise.all(result.rows.map(async (entry) => {
				const widget = await db.Widget.findOne({
					where: { id: entry.widgetId, projectId: req.params.projectId }
				});
				return {
					...entry.toJSON(),
					widgetConfig: widget ? widget.config : null
				};
			}));

			req.dbQuery.count = result.count;
			return next();
		} catch (error) {
			return next(error);
		}
	})
	.get(function(req, res, next) {
		res.json(req.results);
	})

// create choicesguide result
// --------------------------------
  .post(auth.can('ChoicesGuideResult', 'create'))
	.post(function (req, res, next) {
		if (!req.project) return next(createError(401, 'Project niet gevonden'));
		return next();
	})
  .post(function( req, res, next ) {
    let data = {
      userId: req.user && req.user.id,
      result: req.body.submittedData,
			widgetId: req.body.widgetId,
			projectId: req.params.projectId,
			createdAt: new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })),
    };

		db.ChoicesGuideResult
		.authorizeData(data, 'create', req.user, null, req.project)
			.create(data)
			.then((result) => {
				res.json(result);
			})
			.catch(next);
  });


module.exports = router;
