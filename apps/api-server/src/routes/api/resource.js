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
const userhasModeratorRights = (user) => {
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
        userhasModeratorRights(req.user))
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
    userhasModeratorRights(req.user)
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
      projectId: req.params.projectId,
      ...req.queryConditions,
      ...dbQuery.where,
      deletedAt: null,
    };

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

  // create resource
  // -----------
  .post(auth.can('Resource', 'create'))
  .post(function (req, res, next) {
    if (!req.project) return next(createError(401, 'Project niet gevonden'));
    return next();
  })
  .post(function (req, res, next) {
    if (!req.project?.config?.resources?.canAddNewResources) {
      return next(createError(401, 'Inzenden is gesloten'));
    }
    return next();
  })
  .post(function (req, res, next) {
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

    let userId = req.user.id;
    if (hasRole( req.user, 'admin') && req.body.userId) userId = req.body.userId;

    if (!!req.body.submittedData) {
      req.body = {
        ...req.body,
        ...req.body.submittedData,
      };

      delete req.body.submittedData;
    }

    const data = {
      ...req.body,
      projectId: req.params.projectId,
      userId,
      startDate: req.body.startDate || new Date(),
      widgetId: req.body.widgetId || null,
    };

    // Check if resource has images and if so, check their domains
    let imageServer = process.env.IMAGE_APP_URL;
    if (!imageServer) {
      console.log ('Error: No image server found, please provide IMAGE_APP_URL environment variable.');
      return next(createError(500, 'No image server found'));
    }
    // Add protocol to IMAGE_APP_URL for `new URL` to work correctly.
    if (!imageServer.startsWith('http://') && !imageServer.startsWith('https://')) {
      imageServer = 'https://' + imageServer;
    }
    const hostname = new URL(imageServer).hostname;
    if(data.images && data.images.length > 0) {
      data.images.forEach(image => {
        try{
          // Add protocol to image URL for `new URL` to work correctly.
          if (!image.url.startsWith('http://') && !image.url.startsWith('https://')) {
            image.url = 'https://' + image.url;
          }
          const url = new URL(image.url);
          if(url.hostname !== hostname) {
            return next(createError(400, 'Invalid image url'));
          }
        } catch (err) {
          return next(createError(400, 'Invalid image url'));
        }
      });
    }

    let responseData;
    db.Resource.authorizeData(data, 'create', req.user, null, req.project)
      .create(data)
      .then((resourceInstance) => {
        db.Resource.scope(...req.scope)
          .findByPk(resourceInstance.id)
          .then((result) => {
            result.project = req.project;
            req.results = result;
            return next();
          });
      })
      .catch(function (error) {
        // todo: dit komt uit de oude routes; maak het generieker
        if (
          typeof error == 'object' &&
          error instanceof Sequelize.ValidationError
        ) {
          let errors = [];
          error.errors.forEach(function (error) {
            // notNull kent geen custom messages in deze versie van sequelize; zie https://github.com/sequelize/sequelize/issues/1500
            // TODO: we zitten op een nieuwe versie van seq; vermoedelijk kan dit nu wel
            errors.push(
              error.type === 'notNull Violation' && error.path === 'location'
                ? 'Kies een locatie op de kaart'
                : error.message
            );
          });
          //	res.status(422).json(errors);

          next(createError(422, errors.join(', ')));
        } else {
          next(error);
        }
      });
  })
  .post(async function (req, res, next) {
    // skip updating status if user is not allowed to mutate status
    if (!req.results.auth.canMutateStatus(req.user, req.results)) {
      delete req.body.statuses;
    }
    return next();
  })
  .post(async function (req, res, next) {
    // statuses
    let statuses = req.body.statuses || [];
    if (!Array.isArray(statuses)) statuses = [statuses];
    statuses = statuses.filter(status => Number.isInteger(status));
    let defaultStatusses = await db.Status.findAll({ where: { projectId: req.project.id, addToNewResources: true } });
    statuses = statuses.concat( defaultStatusses.map( status => status.id ) );
    statuses = statuses.filter( (value, index) => statuses.indexOf(value) === index ) // unique
    if (statuses.length) {
      await req.results.setStatuses(statuses);
      req.scope.push('includeStatuses');
    }
    return next();
  })
  .post(async function (req, res, next) {
    // tags
    let tags = req.body.tags || [];
    if (!Array.isArray(tags)) tags = [tags];
    tags = tags.filter(tag => !Number.isNaN(parseInt(tag)));
    let defaultTags = await db.Tag.findAll({ where: { projectId: req.project.id, addToNewResources: true } });
    tags = tags.map( tag => parseInt(tag) );
    tags = tags.concat( defaultTags.map( status => status.id ) );
    tags = tags.filter( (value, index) => tags.indexOf(value) === index ) // unique
    if (tags.length) {
      await req.results.setTags(tags);
      req.scope.push('includeTags');
    }
    return next();
  })
  .post(async function (req, res, next) {
    // refetch after tags and status updates
    db.Resource.scope(...req.scope)
      .findOne({
        where: { id: req.results.id, projectId: req.params.projectId },
      })
      .then((result) => {
        req.results = result;
        return next();
      });
  })

  // TODO: Add notifications
  .post(async function (req, res, next) {
    const sendConfirmationToUser = typeof(req.body['confirmationUser']) !== 'undefined' ? req.body['confirmationUser'] : false;
    const sendConfirmationToAdmin = typeof(req.body['confirmationAdmin']) !== 'undefined' ? req.body['confirmationAdmin'] : false;

    res.json(req.results);
    if (!req.query.nomail && req.body['publishDate']) {
      const tags = await req.results.getTags();
      if(tags && tags.length > 0){
        // Convert to csv string
        const emailReceivers = (await Promise.all(tags.flatMap(async (tag) => {
          const {useDifferentSubmitAddress, newSubmitAddress} = await tag.dataValues;
          if(useDifferentSubmitAddress && newSubmitAddress !== null){
            return useDifferentSubmitAddress ? newSubmitAddress.split(',') : [];
          }
          return [];
        }))).filter(data => data !== null && data.length > 0).flat();

        if(emailReceivers.length > 0){
          db.Notification.create({
            type: "new published resource - admin update",
            projectId: req.project.id,
            data: {
              userId: req.user.id,
              resourceId: req.results.id,
              emailReceivers: emailReceivers
            }
          })
        }
      }

      if (sendConfirmationToAdmin) {
        db.Notification.create({
          type: "new published resource - admin update",
          projectId: req.project.id,
          data: {
            userId: req.user.id,
            resourceId: req.results.id,
          }
        })
      }
      
      if (sendConfirmationToUser) {
        db.Notification.create({
          type: "new published resource - user feedback",
          projectId: req.project.id,
          data: {
            userId: req.user.id,
            resourceId: req.results.id
          }
        })
      }
    } else if (!req.query.nomail && !req.body['publishDate']) {
      if (sendConfirmationToUser) {
        db.Notification.create({
          type: "new concept resource - user feedback",
          projectId: req.project.id,
          data: {
            userId: req.user.id,
            resourceId: req.results.id
          }
        })
      }
    }
  });

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
  })

  // update resource
  // -----------
  .put(auth.useReqUser)
  .put(function (req, res, next) {
    if (
      !(
        req.project.config &&
        req.project.config.resources &&
        req.project.config.resources.canAddNewResources
      )
    ) {
      if (!req.results.dataValues.publishDate) {
        return next(
          createError(
            401,
            'Aanpassen en inzenden van concept plannen is gesloten'
          )
        );
      }
    }
    return next();
  })
  .put(function (req, res, next) {
    req.tags = req.body.tags;
    next();
  })
  .put(function (req, res, next) {
    const currentResource = req.results.dataValues;
    const wasConcept = currentResource && !currentResource.publishDate;
    const willNowBePublished = req.body['publishDate'];
    req.changedToPublished = wasConcept && willNowBePublished;
    next();
  })
  .put(function (req, res, next) {
    var resource = req.results;

    if (!(resource && resource.can && resource.can('update')))
      return next(new Error('You cannot update this Resource'));

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

    let data = {
      ...req.body,
    };

    if (userhasModeratorRights(req.user)) {
      if (data.modBreak) {
        data.modBreakUserId = req.body.modBreakUserId = req.user.id;
        data.modBreakDate = req.body.modBreakDate = new Date().toString();
      }
    }

    resource
      .authorizeData(data, 'update')
      .update(data)
      .then((result) => {
        result.project = req.project;
        req.results = result;
        next();
      })
      .catch(next);
  })
  .put(async function (req, res, next) {
    // tags
    let tags = req.body.tags;
    if (!Array.isArray(tags)) return next();

    if (!tags.every((t) => Number.isInteger(t))) {
      next('Tags zijn niet gegeven in het juiste formaat');
    }

    const projectId = req.params.projectId;
    const tagEntities = await getValidTags(projectId, tags, req.user);
    
    const resourceInstance = req.results;
    resourceInstance.setTags(tagEntities).then((result) => {
      // refetch. now with tags
      let scope = [...req.scope, 'includeTags'];
      if (req.canIncludeVoteCount) scope.push('includeVoteCount');
      return db.Resource.scope(...scope)
        .findOne({
          where: { id: resourceInstance.id, projectId: req.params.projectId },
        })
        .then((found) => {
          if (!found) throw new Error('Resource not found');

          if (req.query.includePoll) {
            // TODO: naar poll hooks
            if (found.poll) found.poll.countVotes(!req.query.includeVotes);
          }
          found.project = req.project;
          req.results = found;
          next();
        })
        .catch(next);
    });
  })
  .put(async function (req, res, next) {
    // skip updating status if user is not allowed to mutate status
    if (!req.results.auth.canMutateStatus(req.user, req.results)) {
      delete req.body.statuses;
    }
    return next();
  })
  .put(async function (req, res, next) {
    // statuses
    let statuses = req.body.statuses;
    if (!Array.isArray(statuses)) return next();

    if (!statuses.every((t) => Number.isInteger(t))) {
      next('Statuses zijn niet gegeven in het juiste formaat');
    }

    const projectId = req.params.projectId;
    const statusEntities = await getValidStatuses(projectId, statuses, req.user);

    const resourceInstance = req.results;
    resourceInstance.setStatuses(statusEntities).then((result) => {
      // refetch. now with statuses
      let scope = [...req.scope, 'includeStatuses'];
      if (req.canIncludeVoteCount) scope.push('includeVoteCount');
      return db.Resource.scope(...scope)
        .findOne({
          where: { id: resourceInstance.id, projectId: req.params.projectId },
        })
        .then((found) => {
          if (!found) throw new Error('Resource not found');

          if (req.query.includePoll) {
            // TODO: naar poll hooks
            if (found.poll) found.poll.countVotes(!req.query.includeVotes);
          }
          found.project = req.project;
          req.results = found;
          next();
        })
        .catch(next);
    });
  })
  .put(function (req, res, next) {
    db.Notification.create({
      type: 'updated resource - admin update',
      projectId: req.project.id,
      data: {
        userId: req.user.id,
        resourceId: req.results.id,
      },
    });
    if (req.changedToPublished) {
      db.Notification.create({
        type: 'new published resource - user feedback',
        projectId: req.project.id,
        data: {
          userId: req.user.id,
          resourceId: req.results.id,
        },
      });
    }
    next();
  })
  .put(function (req, res, next) {
    res.json(req.results);
  })

  // delete resource
  // ---------
  .delete(auth.useReqUser)
  .delete(function (req, res, next) {
    const resource = req.results;
    if (!(resource && resource.can && resource.can('delete')))
      return next(new Error('You cannot delete this resource'));

    resource
      .destroy()
      .then(() => {
        res.json({ resource: 'deleted' });
      })
      .catch(next);
  });

// Get all valid tags of the project based on given ids
async function getValidTags(projectId, tags) {
  const uniqueIds = Array.from(new Set(tags));

  const tagsOfProject = await db.Tag.findAll({
    where: { projectId, id: { [Op.in]: uniqueIds } },
  });

  return tagsOfProject;
}

// Get all valid statuses of the project based on given ids
async function getValidStatuses(projectId, statuses) {
  const uniqueIds = Array.from(new Set(statuses));

  const statusesOfProject = await db.Status.findAll({
    where: { projectId, id: { [Op.in]: uniqueIds } },
  });

  return statusesOfProject;
}

module.exports = router;
