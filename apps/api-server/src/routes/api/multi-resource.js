const Sequelize = require('sequelize');
const express = require('express');
const moment = require('moment');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const c = require('config');

const { Op } = require('sequelize');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const router = express.Router({ mergeParams: true });
const userHasModeratorRights = (user) => {
  return hasRole( user, 'moderator')
};

// scopes: for all get requests
router.all('*', function (req, res, next) {
  req.scope = [
    'defaultScope',
    'api',
    { method: ['onlyVisible', req.user.id, req.user.role] },
  ];

  // in case the votes are archived don't use these queries
  // this means they can be cleaned up from the main table for performance reason
  if (!req.project.config.archivedVotes) {
    if (
      req.query.includeVoteCount &&
      ((req.project &&
        req.project.config &&
        req.project.config.votes &&
        req.project.config.votes.isViewable) ||
        userHasModeratorRights(req.user))
    ) {
      req.scope.push({
        method: ['includeVoteCount', req.project.config.votes],
      });
    }

    if (
      req.query.includeUserVote &&
      req.project &&
      req.project.config &&
      req.project.config.votes &&
      req.project.config.votes.isViewable &&
      req.user &&
      req.user.id
    ) {
      // ik denk dat je daar niet het hele object wilt?
      req.scope.push({ method: ['includeUserVote', req.user.id] });
    }
  }
  // because includeVoteCount is used in other locations but should only be active if isViewable
  if (
    (req.project &&
      req.project.config &&
      req.project.config.votes &&
      req.project.config.votes.isViewable) ||
    userHasModeratorRights(req.user)
  ) {
    req.canIncludeVoteCount = true; // scope.push(undefined) would be easier but creates an error
  }

  if (req.query.running) {
    req.scope.push('selectRunning');
  }

  if (req.query.includeComments) {
    req.scope.push({ method: ['includeComments', req.user.id] });
  }

  if (req.query.includeCommentsCount) {
    req.scope.push('includeCommentsCount');
  }

  if (req.query.includeTags) {
    req.scope.push('includeTags');
  }

  if (req.query.includePoll) {
    req.scope.push({ method: ['includePoll', req.user.id] });
  }

  if (req.query.tags) {
    let tags = req.query.tags;
    // if tags is not an array, make it an array
    if (!Array.isArray(tags)) tags = [tags];
    req.scope.push({ method: ['selectTags', tags] });
    req.scope.push('includeTags');
  }

  if (req.query.statuses) {
    let statuses = req.query.statuses;
    // if statuses is not an array, make it an array
    if (!Array.isArray(statuses)) statuses = [statuses];
    req.scope.push({ method: ['selectStatuses', statuses] });
    req.scope.push('includeStatuses');
  }

  if (req.query.includeUser) {
    req.scope.push('includeUser');
  }

  if (req.canIncludeVoteCount) req.scope.push('includeVoteCount');
  // todo? volgens mij wordt dit niet meer gebruikt
  // if (req.query.highlighted) {
  //  	query = db.Resource.getHighlighted({ projectId: req.params.projectId })
  // }

  if (req.query.projectIds) {
    let projectIds = req.query.projectIds;

    if (!Array.isArray(projectIds)) projectIds = [projectIds];
    req.scope.push({ method: ['selectProjectIds', projectIds] });
  }

  return next();
});

router
  .route('/')

  // list resources
  // ----------
  .get(auth.can('Resource', 'list'))
  .get(pagination.init)
  .get(function (req, res, next) {
    let { dbQuery } = req;

    dbQuery.where = {
      ...req.queryConditions,
      deletedAt: null,
    };

    if (req.query.projectIds) {
      const projectIds = Array.isArray(req.query.projectIds) ? req.query.projectIds : [req.query.projectIds];
      dbQuery.where.projectId = {
        [Op.in]: projectIds,
      };
    } else {
      dbQuery.where.projectId = req.params.projectId;
    }

    if (dbQuery.hasOwnProperty('order')) {
      /**
       * Handle yes/no sorting
       */
      dbQuery.order = dbQuery.order.map(function (sortingQuery) {
        if (sortingQuery[0] === 'yes' || sortingQuery[0] === 'no') {
          return [Sequelize.literal(sortingQuery[0]), sortingQuery[1]];
        }

        return sortingQuery;
      });
    }

    db.Resource.scope(...req.scope)
      .findAndCountAll(dbQuery)
      .then(function (result) {
        result.rows.forEach((resource) => {
          resource.project = req.project;
          if (req.query.includePoll && resource.poll)
            resource.poll.countVotes(!req.query.includeVotes);
        });
        const { rows } = result;
        req.results = rows;
        req.dbQuery.count = result.count;

        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(searchInResults({}))
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    res.json(req.results);
  })


// one resource
// --------
router
  .route('/:resourceId(\\d+)')
  .all(function (req, res, next) {
    let resourceId = parseInt(req.params.resourceId) || 0;

    let scope = [...req.scope];
    if (req.canIncludeVoteCount) scope.push('includeVoteCount');

    db.Resource.scope(...scope)
      .findOne({
        where: { id: resourceId, projectId: req.params.projectId },
      })
      .then((found) => {
        if (!found) throw new Error('Resource not found');
        found.project = req.project;
        if (req.query.includePoll) {
          // TODO: naar poll hooks
          if (found.poll) found.poll.countVotes(!req.query.includeVotes);
        }
        req.resource = found;
        req.results = req.resource;
        next();
      })
      .catch((err) => {
        console.log('err', err);
        next(err);
      });
  })

  // view resource
  // ---------
  .get(auth.can('Resource', 'view'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  });

module.exports = router;
