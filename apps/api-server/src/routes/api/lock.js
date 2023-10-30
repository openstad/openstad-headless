const express = require('express');
const createError = require('http-errors');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');

const router = express.Router({ mergeParams: true });

// scopes: for all get requests
router
  .all('*', function(req, res, next) {
    req.scope = [];
    return next();
  })

router.route('/$')

// list locks
// ----------
  .get(auth.can('Lock', 'list'))
	.get(pagination.init)
  .get(function(req, res, next) {
    let { dbQuery } = req;
    let where = {};
    db.Lock
      .scope(...req.scope)
			.findAndCountAll({ where, ...dbQuery })
      .then((result) => {
        req.results = result.rows;
        req.dbQuery.count = result.count;
        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(searchInResults({ searchfields: ['type'] }))
	.get(pagination.paginateResults)
	.get(function(req, res, next) {
		res.json(req.results);
  })

// one lock
// --------
router.route('/:lockId(\\d+)')
  .all(function(req, res, next) {
    let lockId = parseInt(req.params.lockId) || 1;

    db.Lock
      .scope(...req.scope)
      .findOne({
        where: { id: lockId }
      })
      .then((found) => {
        if ( !found ) throw createError(404, 'Lock niet gevonden');
        req.results = found;
        next();
      })
      .catch(next);
  })

// delete lock
// -----------------------
  .delete(auth.can('Lock', 'delete'))
  .delete(function(req, res, next) {
    req.results
      .destroy()
      .then(() => {
        res.json({ lock: 'deleted' });
      })
      .catch(next);
  });

module.exports = router;
