const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');

const express = require('express');
const router = express.Router({ mergeParams: true });
var createError = require('http-errors');

// scopes: for all get requests
router
  .all('*', function(req, res, next) {
    req.scope = ['api'];
    req.scope.push('includeProject');
    return next();
  });

router.route('/')
  .get(auth.can('Datalayer', 'list'))
  .get(pagination.init)
  .get(function(req, res, next) {
    let { dbQuery } = req;

    return db.Datalayer
      .findAndCountAll(dbQuery)
      .then(function(result) {
        req.results = result.rows || [];
        req.dbQuery.count = result.count;
        return next();
      })
      .catch(next);
  })
  .get(searchInResults({}))
  .get(pagination.paginateResults)
  .get(function(req, res, next) {
    res.json(req.results);
  })

  // Persist a datalayer
  .post(auth.can('Datalayer', 'create'))
  .post(function(req, res, next) {
    if (!req.body.name) return next(createError(401, 'Geen naam opgegeven'));
    if (!req.body.layer) return next(createError(401, 'Geen kaartlaag opgegeven'));
    return next();
  })
  .post(function(req, res, next) {
    db.Datalayer
      .create(req.body)
      .catch((err) => {
        console.log('errr', err);
        next(err);
      })
      .then(function(result) {
        res.json({ success: true, id: result.id });
      });
  });

router.route('/:datalayerId(\\d+)')
  .all(function(req, res, next) {
    var datalayerId = parseInt(req.params.datalayerId) || 1;

    db.Datalayer
      .findOne({
        // where: { id: datalayerId, projectId: req.params.projectId }
        where: { id: datalayerId },
      })
      .then(found => {
        if (!found) throw new Error('datalayer not found');

        req.datalayer = found;
        req.results = req.datalayer;
        next();
      })
      .catch((err) => {
        console.log('errr', err);
        next(err);
      });
  })

  // view datalayer
  // ---------
  // .get(auth.can('datalayer', 'view'))
  .get(auth.useReqUser)
  .get(function(req, res, next) {
    res.json(req.results);
  })
  .put(auth.useReqUser)
  .put(function(req, res, next) {
    const datalayer = req.results;

    if (!( datalayer && datalayer.can && datalayer.can('update') )) return next( new Error('You cannot update this datalayer') );

    datalayer
      .authorizeData(datalayer, 'update')
      .update({
        ...req.body,
      })
      .then(result => {
        req.results = result;
        next();
      })
      .catch(next);
  })
  .put(function(req, res, next) {
    let datalayerInstance = req.results;

    return db.Datalayer
      .findOne({
        where: { id: datalayerInstance.id },
        // where: { id: datalayerInstance.id, projectId: req.params.projectId },
      })
      .then(found => {
        if (!found) throw new Error('datalayer not found');
        req.results = found;
        next();
      })
      .catch(next);

  })
  .put(function(req, res, next) {
    res.json(req.results);
  })

  // delete datalayer
  // ---------
  // .delete(auth.can('datalayer', 'delete'))
  .delete(auth.useReqUser)
  .delete(function(req, res, next) {
    const result = req.results;

    if (!(result && result.can && result.can('delete'))) return next(new Error('You cannot delete this datalayer'));

    req.results
      .destroy()
      .then(() => {
        res.json({ 'datalayer': 'deleted' });
      })
      .catch(next);
  });

module.exports = router;
