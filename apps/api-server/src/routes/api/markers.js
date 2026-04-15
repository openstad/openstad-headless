const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');

const express = require('express');
const router = express.Router({ mergeParams: true });
var createError = require('http-errors');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');

const MAX_MARKERS_JSON_SIZE = 1024 * 512; // 512KB

function validateMarkers(markers) {
  if (!Array.isArray(markers)) return false;
  if (JSON.stringify(markers).length > MAX_MARKERS_JSON_SIZE) return false;
  return markers.every(
    (m) => typeof m.lat === 'number' && typeof m.lng === 'number'
  );
}

// scopes: for all get requests
router.all('*', function (req, res, next) {
  req.scope = ['api'];
  return next();
});

router
  .route('/')
  .get(auth.can('Markers', 'list'))
  .get(pagination.init)
  .get(function (req, res, next) {
    let { dbQuery } = req;

    dbQuery.where = dbQuery.where || {};
    dbQuery.where.projectId = req.params.projectId;

    return db.Markers.findAndCountAll(dbQuery)
      .then(function (result) {
        req.results = result.rows || [];
        req.dbQuery.count = result.count;
        return next();
      })
      .catch(next);
  })
  .get(searchInResults({}))
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // create markers
  .post(auth.can('Markers', 'create'))
  .post(function (req, res, next) {
    if (!req.body.name) return next(createError(400, 'Geen naam opgegeven'));
    if (req.body.markers && !validateMarkers(req.body.markers)) {
      return next(createError(400, 'Ongeldige markers data'));
    }
    return next();
  })
  .post(rateLimiter(), function (req, res, next) {
    db.Markers.create({
      name: req.body.name,
      markers: req.body.markers || [],
      projectId: req.params.projectId,
    })
      .then(function (result) {
        res.json(result);
      })
      .catch(next);
  });

router
  .route('/:markersId(\\d+)')
  .all(function (req, res, next) {
    var markersId = parseInt(req.params.markersId);

    if (!markersId) {
      return next(createError(400, 'invalid markers id'));
    }

    db.Markers.findOne({
      where: { id: markersId, projectId: req.params.projectId },
    })
      .then((found) => {
        if (!found) {
          return next(createError(404, 'markers not found'));
        }

        req.markers = found;
        req.results = req.markers;
        next();
      })
      .catch(next);
  })

  // view markers
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // update markers
  .put(auth.useReqUser)
  .put(function (req, res, next) {
    if (req.body.markers && !validateMarkers(req.body.markers)) {
      return next(createError(400, 'Ongeldige markers data'));
    }
    return next();
  })
  .put(rateLimiter(), function (req, res, next) {
    const markers = req.results;

    if (!(markers && markers.can && markers.can('update')))
      return next(new Error('You cannot update this markers'));

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.markers !== undefined) updateData.markers = req.body.markers;

    markers
      .authorizeData(markers, 'update')
      .update(updateData)
      .then((result) => {
        req.results = result;
        next();
      })
      .catch(next);
  })
  .put(function (req, res, next) {
    return db.Markers.findOne({
      where: { id: req.results.id, projectId: req.params.projectId },
    })
      .then((found) => {
        if (!found) {
          return next(createError(404, 'markers not found'));
        }
        req.results = found;
        next();
      })
      .catch(next);
  })
  .put(function (req, res, next) {
    res.json(req.results);
  })

  // delete markers
  .delete(auth.useReqUser)
  .delete(function (req, res, next) {
    const result = req.results;

    if (!(result && result.can && result.can('delete')))
      return next(new Error('You cannot delete this markers'));

    req.results
      .destroy()
      .then(() => {
        res.json({ markers: 'deleted' });
      })
      .catch(next);
  });

// duplicate markers
router
  .route('/:markersId(\\d+)/duplicate')
  .post(auth.can('Markers', 'create'))
  .post(rateLimiter(), function (req, res, next) {
    var markersId = parseInt(req.params.markersId);

    if (!markersId) {
      return next(createError(400, 'invalid markers id'));
    }

    db.Markers.findOne({
      where: { id: markersId, projectId: req.params.projectId },
    })
      .then((found) => {
        if (!found) {
          return next(createError(404, 'markers not found'));
        }

        return db.Markers.create({
          name: found.name + ' (kopie)',
          markers: found.markers,
          projectId: req.params.projectId,
        });
      })
      .then((result) => {
        res.json(result);
      })
      .catch(next);
  });

module.exports = router;
