const createError = require('http-errors');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchResults = require('../../middleware/search-results-static');

const express = require('express');
const router = express.Router({ mergeParams: true });

// scopes: for all get requests
router
  .all('*', function(req, res, next) {
    req.scope = ['defaultScope', 'withIdea'];
    req.scope.push({ method: ['forProjectId', req.params.projectId] });

    if (req.query.includeRepliesOnComments) {
      req.scope.push('includeRepliesOnComments');
      req.scope.push({ method: ['includeRepliesOnComments', req.user.id] });
    }

    if (req.query.withVoteCount) {
      req.scope.push({ method: ['withVoteCount', 'comment'] });
    }

    if (req.query.withUserVote) {
      req.scope.push({ method: ['withUserVote', 'comment', req.user.id] });
    }

    return next();

  })
  .all('*', function(req, res, next) {
    // zoek het idee
    // todo: ik denk momenteel alleen nog gebruikt door create; dus zet hem daar neer
    let ideaId = parseInt(req.params.ideaId) || 0;
    if (!ideaId) return next();
    db.Idea.findByPk(ideaId)
      .then(idea => {
        if (!idea || idea.projectId != req.params.projectId) return next(createError(400, 'Idea not found'));
        req.idea = idea;
        return next();
      });
  })
  .all('/:commentId(\\d+)(/vote)?', function(req, res, next) {

    // with one existing comment
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

    let ideaId = parseInt(req.params.ideaId) || 0;
    let where = {};
    if (ideaId) {
      where.ideaId = ideaId;
    }
    let sentiment = req.query.sentiment;
    if (sentiment && (sentiment == 'against' || sentiment == 'for' || sentiment == 'no sentiment')) {
      where.sentiment = sentiment;
    }

    return db.Comment
      .scope(...req.scope)
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
  .get(searchResults)
  .get(pagination.paginateResults)
  .get(function(req, res, next) {
    res.json(req.results);
  })

  // create comment
  // ---------------
  .post(auth.can('Comment', 'create'))
  .post(auth.useReqUser)
  .post(function(req, res, next) {

    if (!req.idea) return next(createError(400, 'Inzending niet gevonden'));
    if (!req.idea.publishDate) return next(createError(400, 'Kan geen comment toevoegen aan een concept plan'));
    // todo: dit moet een can functie worden
    if (req.user.role != 'admin' && req.idea.status != 'OPEN') return next(createError(400, 'Reactie toevoegen is niet mogelijk bij planen met status: ' + req.idea.status));
    next();
  })
  .post(function(req, res, next) {
    if (!req.body.parentId) return next();
    db.Comment
      .scope(
        'defaultScope',
        'withIdea',
      )
      .findByPk(req.body.parentId)
      .then(function(comment) {
        if (!(comment && comment.can && comment.can('reply', req.user))) return next(new Error('You cannot reply to this comment'));
        return next();
      });
  })
  .post(function(req, res, next) {

    let userId = req.user.id;
    if (req.user.role == 'admin' && req.body.userId) userId = req.body.userId;
    
    let data = {
      ...req.body,
      ideaId: req.params.ideaId,
      userId,
    };


    db.Comment
      .authorizeData(data, 'create', req.user)
      .create(data)
      .then(result => {

        db.Comment
          .scope(
            'defaultScope',
            'withIdea',
            { method: ['withVoteCount', 'comment'] },
            { method: ['withUserVote', 'comment', req.user.id] },
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
            'withIdea',
            { method: ['withVoteCount', 'comment'] },
            { method: ['withUserVote', 'comment', req.user.id] },
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
