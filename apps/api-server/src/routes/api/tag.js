const express = require('express');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');

let router = express.Router({ mergeParams: true });

router.all('*', function (req, res, next) {
  req.scope = [];
  req.scope.push('defaultScope');
  req.scope.push({ method: ['forProjectId', req.project.id] });

  if (req.query.includeProject) {
    req.scope.push('includeProject');
  }

  if (req.query.type) {
    let type = req.query.type;
    req.scope.push({ method: ['selectType', type] });
  }
  
  if (req.query.tags) {
    let tags = req.query.tags;
    req.scope.push({ method: ['onlyWithIds', tags] });
  }

  next();
});

router
  .route('/')

  // list tags
  // --------------
  .get(auth.can('Tag', 'list'))
  .get(auth.useReqUser)
  .get(pagination.init)
  .get(function (req, res, next) {
    let { dbQuery } = req;

    req.scope.push({ method: ['forProjectId', req.params.projectId] });

    db.Tag.scope(...req.scope)
      .findAndCountAll(dbQuery)
      .then((result) => {
        req.results = result.rows;
        req.dbQuery.count = result.count;
        next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // create tag
  // ---------------
  .post(auth.can('Tag', 'create'))
  .post(function (req, res, next) {
    const data = {
      name: req.body.name,
      type: req.body.type,
      seqnr: req.body.seqnr,
      addToNewResources: req.body.addToNewResources,
      projectId: req.params.projectId,
      useDifferentSubmitAddress: req.params.useDifferentSubmitAddress,
      newSubmitAddress: req.params.newSubmitAddress,
      defaultResourceImage: req.params.defaultResourceImage,
      documentMapIconColor: req.params.documentMapIconColor || '#000000',
    };

    db.Tag.authorizeData(data, 'create', req.user)
      .create(data)
      .then((result) => {
        res.json(result);
      })
      .catch(next);
  });

// with one existing tag
// --------------------------
router
  .route('/:tagId(\\d+)')
  .all(auth.useReqUser)
  .all(function (req, res, next) {
    const tagId = parseInt(req.params.tagId);
    if (!tagId) next('No tag id found');

    req.scope = ['defaultScope'];
    req.scope.push({ method: ['forProjectId', req.params.projectId] });

    db.Tag.scope(...req.scope)
      .findOne({ where: { id: tagId } })
      .then((found) => {
        if (!found) throw new Error('Tag not found');
        req.results = found;
        next();
      })
      .catch(next);
  })

  // view tag
  // -------------
  .get(auth.can('Tag', 'view'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // update tag
  // ---------------
  .put(auth.useReqUser)
  .put(function (req, res, next) {
    const tag = req.results;
    if (!(tag && tag.can && tag.can('update')))
      return next(new Error('You cannot update this tag'));
    tag
      .authorizeData(req.body, 'update')
      .update(req.body)
      .then((result) => {
        res.json(result);
      })
      .catch(next);
  })

  // delete tag
  // ---------------
  .delete(auth.can('Tag', 'delete'))
  .delete(function (req, res, next) {
    req.results
      .destroy()
      .then(() => {
        res.json({ tag: 'deleted' });
      })
      .catch(next);
  });

module.exports = router;
