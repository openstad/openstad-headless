const createError = require('http-errors');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const express = require('express');
const router = express.Router({ mergeParams: true });

// scopes: for all get requests
router
  .all('*', function(req, res, next) {

    const method = req.params.imageResourceId ? 'forProjectId' : 'forProjectIdImageResource';
    const scope = req.params.imageResourceId ? 'includeResource' : 'includeImageResource';

    req.scope = ['defaultScope', scope];
    req.scope.push({ method: [method, req.params.projectId] });

    if (req.query.includeRepliesOnComments) {
      req.scope.push('includeRepliesOnComments');
      req.scope.push({ method: ['includeRepliesOnComments', req.user.id] });
    }

    if (req.query.includeVoteCount) {
      req.scope.push({ method: ['includeVoteCount', 'comment'] });
    }

    if (req.query.includeUserVote) {
      req.scope.push({ method: ['includeUserVote', 'comment', req.user.id] });
    }

    return next();

  })
  .all('*', function(req, res, next) {
    let resourceId = parseInt(req.params.resourceId);
    let imageResourceId = parseInt(req.params.imageResourceId);

    function fetchAndValidateResource(model, id) {
      model.scope('includeProject').findByPk(id)
        .then(resource => {
          if (!resource || resource.projectId != req.params.projectId) {
            return next(createError(400, 'Resource not found'));
          }
          req.resource = resource;
          return next();
        })
        .catch(err => next(createError(500, 'Database error')));
    }

    if (resourceId) {
      return fetchAndValidateResource(db.Resource, resourceId);
    } else if (imageResourceId) {
      return fetchAndValidateResource(db.ImageResource, imageResourceId);
    } else {
      return next();
    }
  })

  .all('/:commentId(\\d+)(/vote)?', function(req, res, next) {

    // include one existing comment
    // --------------------------

    var commentId = parseInt(req.params.commentId) || 1;

    let sentiment = req.query.sentiment;
    let where = { id: commentId };

    if (sentiment && (sentiment == 'against' || sentiment == 'for' || sentiment == 'no sentiment')) {
      where.sentiment = sentiment;
    }

    db.Comment
      .scope(...req.scope)
      .findOne({
        where,
      })
      .then(entry => {
        if (!entry) throw new Error('Comment not found');
        req.results = entry;
        return next();
      })
      .catch(next);

  });

router.route('/')

  // list comments
  // --------------
.get(auth.can('Comment', 'list'))
  .get(pagination.init)
  .get(function(req, res, next) {
    let { dbQuery } = req;

    let resourceId, imageResourceId;

    if ( !!req.params.imageResourceId ) {
      imageResourceId = parseInt(req.params.imageResourceId) || 0;
    } else {
      resourceId = parseInt(req.params.resourceId) || 0;
    }

    let where = {};

    const scope = [
      { method: [ 'includeVoteCount', 'comment' ] },
      'includeRepliesOnComments',
      'defaultScope',
    ];

    if (imageResourceId) {
      where.imageResourceId = imageResourceId;
      scope.push(
        'includeImageResource',
        { method: [ 'forProjectIdImageResource', req.params.projectId ] },
        { method: [ 'includeRepliesOnComments', imageResourceId ] },
        { method: [ 'includeUserVote', 'comment', imageResourceId ] }
      )
    } else if (resourceId) {
      where.resourceId = resourceId;
      scope.push(
        'includeResource',
        { method: [ 'forProjectId', req.params.projectId ] },
        { method: [ 'includeRepliesOnComments', resourceId ] },
        { method: [ 'includeUserVote', 'comment', resourceId ] }
      )
    }

    let sentiment = req.query.sentiment;
    if (sentiment && (sentiment == 'against' || sentiment == 'for' || sentiment == 'no sentiment')) {
      where.sentiment = sentiment;
    }

    return db.Comment
      .scope(...scope)
      .findAndCountAll(
        {
          where,
          ...dbQuery,
        },
      )
      .then(function(result) {
        req.results = result.rows;
        req.dbQuery.count = result.count;
        return next();
      })
      .catch(next);

  })
  .get(auth.useReqUser)
  .get(searchInResults({ searchfields: ['description'] }))
  .get(pagination.paginateResults)
  .get(function(req, res, next) {
    res.json(req.results);
  })

  // create comment
  // ---------------
  .post(auth.can('Comment', 'create'))
  .post(auth.useReqUser)
  .post(function(req, res, next) {

    if (!req.resource) return next(createError(400, 'Inzending niet gevonden'));
    // if (!req.resource.auth.canComment(req.resource)) return next(createError(400, 'Je kunt niet reageren op deze inzending'));
    return next();
  })
  .post(function(req, res, next) {
    if (!req.body.parentId) return next();
    db.Comment
      .scope(
        'defaultScope',
        'includeResource',
      )
      .findByPk(req.body.parentId)
      .then(function(comment) {
        if (!(comment && comment.can && comment.can('reply', req.user))) return next(new Error('You cannot reply to this comment'));
        return next();
      });
  })
  .post(function(req, res, next) {

    let userId = req.user.id;
    if (hasRole( req.user, 'admin') && req.body.userId) userId = req.body.userId;

    const attr = {};

    if ( !!req.params.imageResourceId ) {
      attr['imageResourceId'] = parseInt(req.params.imageResourceId);
    } else {
      attr['resourceId'] = parseInt(req.params.resourceId);
    }

    try {
      req.body.location = req.body.location
        ? JSON.parse(req.body.location)
        : null;
    } catch (err) {}

    if (
      req.body.location &&
      typeof req.body.location == 'object' &&
      !Object.keys(req.body.location).length
    ) {
      req.body.location = null;
    }

    let data = {
      ...req.body,
      ...attr,
      userId,
    };


    db.Comment
      .authorizeData(data, 'create', req.user)
      .create(data)
      .then(result => {

        db.Comment
          .scope(
            'defaultScope',
            'includeResource',
            { method: ['includeVoteCount', 'comment'] },
            { method: ['includeUserVote', 'comment', req.user.id] },
          )
          .findByPk(result.id)
          .then(function(comment) {
            res.json(comment);
          });

      })
      .catch(next);

  });

router.route('/:commentId(\\d+)')

  // view comment
  // -------------
  .get(auth.can('Comment', 'view'))
  .get(auth.useReqUser)
  .get(function(req, res, next) {
    res.json(req.results);
  })

  // update comment
  // ---------------
  .put(auth.useReqUser)
  .put(function(req, res, next) {
    var comment = req.results;
    if (!(comment && comment.can && comment.can('update'))) return next(new Error('You cannot update this comment'));

    if (req.body.location) {
      try {
        req.body.location = JSON.parse(req.body.location || null);
      } catch (err) {}

      if (
        req.body.location &&
        typeof req.body.location === 'object' &&
        !Object.keys(req.body.location).length
      ) {
        req.body.location = undefined;
      }
    } else {
      if (req.body.location === null) {
        req.body.location = JSON.parse(null);
      }
    }

    comment
      .authorizeData(req.body, 'update')
      .update(req.body)
      .then(result => {
        res.json(result);
      })
      .catch(next);
  })

  // delete comment
  // --------------
  .delete(auth.useReqUser)
  .delete(function(req, res, next) {
    const comment = req.results;
    if (!( comment && comment.can && comment.can('delete') )) return next( new Error('You cannot delete this comment') );

    comment
      .destroy()
      .then(() => {
        res.json({ 'comment': 'deleted' });
      })
      .catch(next);
  });

router.route('/:commentId(\\d+)/vote')

  // vote for comment
  // -----------------

  .post(auth.useReqUser)
  .post(function(req, res, next) {
    var user = req.user;
    var comment = req.results;

    if (!(comment && comment.can && comment.can('vote'))) return next(new Error('You cannot vote for this comment'));

    comment.addUserVote(user, req.ip)
      .then(function(voteRemoved) {

        db.Comment
          .scope(
            'defaultScope',
            'includeResource',
            { method: ['includeVoteCount', 'comment'] },
            { method: ['includeUserVote', 'comment', req.user.id] },
          )
          .findByPk(comment.id)
          .then(function(comment) {
            req.results = comment;
            return next();
          });

      })
      .catch(next);
  })
  .post(function(req, res, next) {
    res.json(req.results);
    // setTimeout(function() {
    //   res.json(req.results);
    // }, 1000)
  });

module.exports = router;
