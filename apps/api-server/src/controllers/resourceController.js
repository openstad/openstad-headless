/**
 * Resource controller.
 *
 * Request/response orchestration for the resource routes. Extracted from
 * routes/api/resource.js (#1640); see doc/adr-0001-api-server-layering.md.
 * Business logic lives in services/resourceExtraData.js and
 * services/resourceTagsStatuses.js. Handlers are exported individually so the
 * route file wires them into the same middleware chains, in the same order.
 */
const Sequelize = require('sequelize');
const createError = require('http-errors');
const db = require('../db');
const hasRole = require('../lib/sequelize-authorization/lib/hasRole');
const {
  analyzeSpamPayload,
  isSpamFilterEnabled,
  logSpamAnalysis,
  removeSpamMetaFields,
} = require('../services/spam-detector');
const {
  attachModeratorOnlyExtraDataKeys,
} = require('../services/resourceExtraData');
const {
  getValidTags,
  getValidStatuses,
  getOnlyIds,
} = require('../services/resourceTagsStatuses');
const { stripFocalPoints } = require('../lib/resource-media-fields');
const { collectStreets } = require('../lib/resource-streets');
const { stripVisibilityScope } = require('../lib/resource-create-scope');
const { normalizeContributedUrl } = require('../util/normalize-url');
const resourceLinks = require('../services/resource-links');
const resourceLinkRequests = require('../services/resource-link-requests');
const {
  snapshotModBreakIds,
  snapshotModBreakDescriptions,
  findNewModBreaks,
  findChangedModBreaks,
  resolveModBreakRecipients,
  sendModBreakNotifications,
} = require('../lib/modbreak-notifications');

const userhasModeratorRights = (user) => {
  return hasRole(user, 'editor');
};

const canSetFocalPoint = (user) => hasRole(user, ['editor', 'moderator']);

function stripHiddenVoteScore(resources, canIncludeVoteCount) {
  if (canIncludeVoteCount) return;

  const records = Array.isArray(resources) ? resources : [resources];
  records.filter(Boolean).forEach((resource) => {
    resource.score = undefined;
  });
}

function captureLinkSelection(req) {
  req.linkSelection = resourceLinkRequests.parseSelection(req.body.links);
  req.removedLinks = resourceLinkRequests.parseRemoved(req.body.removedLinks);
  resourceLinkRequests.assertHandlerAvailable(
    req.linkSelection,
    req.removedLinks
  );
  delete req.body.links;
  delete req.body.removedLinks;
}

function normalizeExtraDataUrl(data) {
  if (!data.extraData || typeof data.extraData.url === 'undefined') {
    return null;
  }
  const urlResult = normalizeContributedUrl(data.extraData.url);
  if (!urlResult.ok) {
    return createError(
      400,
      'De ingevulde URL is ongeldig. Controleer of de link correct is en begin met https://'
    );
  }
  data.extraData.url = urlResult.value;
  return null;
}

async function submitLinkRequests(req, mode) {
  const linkRequests = await resourceLinkRequests.submitSelection({
    project: req.project,
    resource: req.results,
    selection: req.linkSelection,
    removed: req.removedLinks,
    user: req.user,
    mode,
  });
  if (linkRequests) req.results.linkRequests = linkRequests;
}

function logNotificationError(message) {
  return (err) => console.error(message, err);
}

async function getUpdatedResourceEmailFlags(projectId) {
  try {
    const project =
      await db.Project.scope('includeEmailConfig').findByPk(projectId);
    const notifications = project?.emailConfig?.notifications;

    return {
      admin: notifications?.sendUpdatedResourceAdminEmail === true,
      user: notifications?.sendUpdatedResourceUserEmail === true,
      modBreakAuthor: notifications?.sendModBreakNotification === true,
    };
  } catch (err) {
    console.error(
      `Failed to read updated resource email settings for project ${projectId}:`,
      err
    );
    return { admin: false, user: false, modBreakAuthor: false };
  }
}

async function sendUpdatedResourceUserEmail(req) {
  const recipients = await resolveModBreakRecipients({
    db,
    resource: req.results,
    excludeUserId: req.user?.id,
  });
  for (const recipient of recipients) {
    await db.Notification.create({
      type: 'updated resource - user feedback',
      projectId: req.project.id,
      data: {
        userId: recipient.userId,
        resourceId: req.results.id,
      },
    });
  }
}

// ----------------------------------------------------------------------------
// Scope (runs for all requests)
// ----------------------------------------------------------------------------

function setResourceScope(req, res, next) {
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

    if (req.query.includeUserVote && req.user && req.user.id) {
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

  if (req.query.excludeTags) {
    let excludeTags = req.query.excludeTags;
    if (!Array.isArray(excludeTags)) excludeTags = [excludeTags];
    req.scope.push({ method: ['excludeTags', excludeTags] });
  }

  if (req.query.statuses) {
    let statuses = req.query.statuses;
    // if statuses is not an array, make it an array
    if (!Array.isArray(statuses)) statuses = [statuses];
    req.scope.push({ method: ['selectStatuses', statuses] });
  }

  if (req.query.excludeStatuses) {
    let excludeStatuses = req.query.excludeStatuses;
    if (!Array.isArray(excludeStatuses)) excludeStatuses = [excludeStatuses];
    req.scope.push({ method: ['excludeStatuses', excludeStatuses] });
  }

  if (req.query.tagGroups) {
    try {
      const tagGroups = JSON.parse(req.query.tagGroups);
      if (Array.isArray(tagGroups) && tagGroups.length > 0) {
        req.scope.push({ method: ['selectTagGroups', tagGroups] });
      }
    } catch (e) {
      // invalid JSON, ignore
    }
  }

  if (req.query.lat && req.query.lng && req.query.maxDistance) {
    req.scope.push({
      method: [
        'withinDistance',
        req.query.lat,
        req.query.lng,
        req.query.maxDistance,
      ],
    });
  }

  if (req.query.includeUser) {
    req.scope.push('includeUser');
  }

  if (
    req?.query?.projectIds &&
    (typeof req?.query?.projectIds === 'object' ||
      typeof req?.query?.projectIds === 'string')
  ) {
    let projectIds = req.query.projectIds;

    if (!Array.isArray(projectIds)) projectIds = [projectIds];
    req.scope.push({ method: ['selectProjectIds', projectIds] });
    req.query.projectIds = projectIds;
  }

  if (
    req?.query?.ids &&
    (typeof req?.query?.ids === 'object' || typeof req?.query?.ids === 'string')
  ) {
    let ids = req.query.ids;
    if (!Array.isArray(ids)) ids = [ids];
    req.scope.push({ method: ['selectIds', ids] });
    req.query.ids = ids;
  }

  if (req.canIncludeVoteCount) req.scope.push('includeVoteCount');

  return next();
}

// ----------------------------------------------------------------------------
// Markers  (GET /markers)
// ----------------------------------------------------------------------------

function listMarkers(req, res, next) {
  if (req.query.search) {
    req.scope.push('markerFieldsWithSearch');
  } else {
    req.scope.push('markerFields');
  }
  req.scope.push('includeTags');

  let { dbQuery } = req;

  dbQuery.where = {
    ...req.queryConditions,
    ...dbQuery.where,
    deletedAt: null,
  };

  let projectIds = req?.query?.projectIds || [];

  if (
    !Array.isArray(projectIds) ||
    (Array.isArray(projectIds) && projectIds.length === 0)
  ) {
    dbQuery.where.projectId = req.params.projectId;
  }

  db.Resource.scope(...req.scope)
    .findAll(dbQuery)
    .then(function (resources) {
      req.results = resources;
      return next();
    })
    .catch(next);
}

// ----------------------------------------------------------------------------
// Streets  (GET /streets)
// ----------------------------------------------------------------------------

function listStreets(req, res, next) {
  req.scope.push('markerFields');
  db.Resource.scope(...req.scope)
    .findAll({ where: { projectId: req.params.projectId, deletedAt: null } })
    .then((resources) => res.json(collectStreets(resources)))
    .catch(next);
}

// ----------------------------------------------------------------------------
// List resources  (GET /)
// ----------------------------------------------------------------------------

function listResources(req, res, next) {
  let { dbQuery } = req;

  dbQuery.where = {
    ...req.queryConditions,
    ...dbQuery.where,
    deletedAt: null,
  };

  let projectIds = req?.query?.projectIds || [];

  if (
    !Array.isArray(projectIds) ||
    (Array.isArray(projectIds) && projectIds.length === 0)
  ) {
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
    .then(async function (result) {
      result.rows.forEach((resource) => {
        resource.project = req.project;
        if (req.query.includePoll && resource.poll)
          resource.poll.countVotes(!req.query.includeVotes);
      });
      stripHiddenVoteScore(result.rows, req.canIncludeVoteCount);
      await attachModeratorOnlyExtraDataKeys(result.rows);
      const { rows } = result;
      req.results = rows;
      req.dbQuery.count = result.count;

      return next();
    })
    .catch(next);
}

function respondResults(req, res, next) {
  res.json(req.results);
}

// ----------------------------------------------------------------------------
// Create resource  (POST /)
// ----------------------------------------------------------------------------

function requireProject(req, res, next) {
  if (!req.project) return next(createError(401, 'Project niet gevonden'));
  return next();
}

function requireCanAddResources(req, res, next) {
  if (!req.project?.config?.resources?.canAddNewResources) {
    return next(createError(401, 'Inzenden is gesloten'));
  }
  return next();
}

// Build the create payload from the request: parse location, merge submitted
// data and run spam detection (sets req.isSpamSubmission).
function prepareCreateResourceData(req) {
  try {
    req.body.location = req.body.location
      ? JSON.parse(req.body.location)
      : null;
  } catch (err) {
    console.error('[resource-create] Could not parse location:', err.message);
  }

  if (
    req.body.location &&
    typeof req.body.location == 'object' &&
    !Object.keys(req.body.location).length
  ) {
    req.body.location = null;
  }

  let userId = req.user.id;
  if (hasRole(req.user, 'admin') && req.body.userId) userId = req.body.userId;

  if (!!req.body.submittedData) {
    req.body = {
      ...req.body,
      ...req.body.submittedData,
    };

    delete req.body.submittedData;
  }

  if (isSpamFilterEnabled()) {
    const analysis = analyzeSpamPayload(req.body, { withDetails: true });
    logSpamAnalysis({ routeName: 'resource', req, analysis });
    req.isSpamSubmission = analysis.isProbablySpam;
  } else {
    req.isSpamSubmission = false;
  }

  req.body = removeSpamMetaFields(req.body);
  if (req.isSpamSubmission) {
    req.body.publishDate = null;
  }

  if (req.body.images !== undefined && !canSetFocalPoint(req.user)) {
    req.body.images = stripFocalPoints(req.body.images);
  }

  return {
    ...req.body,
    projectId: req.params.projectId,
    userId,
    startDate: req.body.startDate || new Date(),
    widgetId: req.body.widgetId || null,
    isSpam: req.isSpamSubmission,
  };
}

function createResource(req, res, next) {
  const data = prepareCreateResourceData(req);

  try {
    captureLinkSelection(req);
  } catch (err) {
    return next(err);
  }
  delete data.links;
  delete data.removedLinks;

  // Check if resource has images and if so, check their domains
  let imageServer = process.env.IMAGE_APP_URL;
  if (!imageServer) {
    console.log(
      'Error: No image server found, please provide IMAGE_APP_URL environment variable.'
    );
    return next(createError(500, 'No image server found'));
  }
  // Add protocol to IMAGE_APP_URL for `new URL` to work correctly.
  if (
    !imageServer.startsWith('http://') &&
    !imageServer.startsWith('https://')
  ) {
    imageServer = 'https://' + imageServer;
  }
  const hostname = new URL(imageServer).hostname;
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    for (const image of data.images) {
      try {
        // Add protocol to image URL for `new URL` to work correctly.
        if (
          !image.url.startsWith('http://') &&
          !image.url.startsWith('https://')
        ) {
          image.url = 'https://' + image.url;
        }
        const url = new URL(image.url);
        if (url.hostname !== hostname) {
          return next(createError(400, 'Invalid image url'));
        }
      } catch (err) {
        return next(createError(400, 'Invalid image url'));
      }
    }
  }

  const urlError = normalizeExtraDataUrl(data);
  if (urlError) return next(urlError);

  db.Resource.authorizeData(data, 'create', req.user, null, req.project)
    .create(data)
    .then((resourceInstance) => {
      req.createdResource = resourceInstance;
      db.Resource.scope(...stripVisibilityScope(req.scope))
        .findByPk(resourceInstance.id)
        .then(async (result) => {
          if (!result) {
            return next(
              createError(500, 'Failed to load resource after creation')
            );
          }
          result.project = req.project;
          await attachModeratorOnlyExtraDataKeys(result);
          req.results = result;
          return next();
        })
        .catch(next);
    })
    .catch(function (error) {
      if (
        typeof error == 'object' &&
        error instanceof Sequelize.ValidationError
      ) {
        let errors = [];
        error.errors.forEach(function (error) {
          errors.push(
            error.type === 'notNull Violation' && error.path === 'location'
              ? 'Kies een locatie op de kaart'
              : error.message
          );
        });

        console.error('[resource-create] Validation error:', {
          projectId: req.params.projectId,
          widgetId: req.body?.widgetId || null,
          errors: errors,
        });

        next(createError(422, errors.join(', ')));
      } else {
        console.error('[resource-create] Failed:', {
          projectId: req.params.projectId,
          widgetId: req.body?.widgetId || null,
          error: error.message || error,
        });
        next(error);
      }
    });
}

async function stripStatusesIfCannotMutate(req, res, next) {
  // skip updating status if user is not allowed to mutate status
  if (!req.results.auth.canMutateStatus(req.user, req.results)) {
    delete req.body.statuses;
  }
  return next();
}

async function applyDefaultStatuses(req, res, next) {
  // statuses
  let statuses = req.body.statuses || [];
  if (!Array.isArray(statuses)) statuses = [statuses];
  statuses = statuses.filter((status) => Number.isInteger(status));
  if (statuses.length) {
    statuses = (await getValidStatuses(req.project.id, statuses)).map(
      (status) => status.id
    );
  }
  let defaultStatuses = await db.Status.findAll({
    where: { projectId: req.project.id, addToNewResources: true },
  });
  statuses = statuses.concat(defaultStatuses.map((status) => status.id));
  statuses = statuses.filter(
    (value, index) => statuses.indexOf(value) === index
  ); // unique
  if (statuses.length) {
    await req.results.setStatuses(statuses);
    req.scope.push('includeStatuses');
  }
  return next();
}

async function applyDefaultTags(req, res, next) {
  // tags
  let tags = req.body.tags || [];
  if (!Array.isArray(tags)) tags = [tags];
  tags = tags.filter((tag) => !Number.isNaN(parseInt(tag)));
  let defaultTags = await db.Tag.findAll({
    where: { projectId: req.project.id, addToNewResources: true },
  });
  tags = tags.map((tag) => parseInt(tag));
  if (tags.length) {
    tags = (await getValidTags(req.project.id, tags, true)).map(
      (tag) => tag.id
    );
  }
  tags = tags.concat(defaultTags.map((status) => status.id));
  tags = tags.filter((value, index) => tags.indexOf(value) === index); // unique
  if (tags.length) {
    await req.results.setTags(tags);
    req.scope.push('includeTags');
  }
  return next();
}

function refetchCreatedResource(req, res, next) {
  // refetch after tags and status updates
  db.Resource.scope(...req.scope)
    .findOne({
      where: { id: req.results.id, projectId: req.params.projectId },
    })
    .then(async (result) => {
      await attachModeratorOnlyExtraDataKeys(result);
      req.results = result;
      return next();
    })
    .catch(next);
}

async function submitCreateLinkRequests(req, res, next) {
  if (req.isSpamSubmission) return next();
  try {
    await submitLinkRequests(req, 'create');
    next();
  } catch (err) {
    next(err);
  }
}

async function sendCreateNotifications(req, res, next) {
  const sendConfirmationToUser =
    typeof req.body['confirmationUser'] !== 'undefined'
      ? req.body['confirmationUser']
      : false;
  const sendConfirmationToAdmin =
    typeof req.body['confirmationAdmin'] !== 'undefined'
      ? req.body['confirmationAdmin']
      : false;

  res.json(req.results);
  if (req.isSpamSubmission) return;

  if (!req.query.nomail && req.body['publishDate']) {
    const tags = await req.results.getTags();
    if (tags && tags.length > 0) {
      // Convert to csv string
      const emailReceivers = (
        await Promise.all(
          tags.flatMap(async (tag) => {
            const { useDifferentSubmitAddress, newSubmitAddress } =
              await tag.dataValues;
            if (useDifferentSubmitAddress && newSubmitAddress !== null) {
              return useDifferentSubmitAddress
                ? newSubmitAddress.split(',')
                : [];
            }
            return [];
          })
        )
      )
        .filter((data) => data !== null && data.length > 0)
        .flat();

      if (emailReceivers.length > 0) {
        db.Notification.create({
          type: 'new published resource - admin update',
          projectId: req.project.id,
          data: {
            userId: req.user.id,
            resourceId: req.results.id,
            emailReceivers: emailReceivers,
          },
        }).catch(
          logNotificationError('Error sending admin notification for resource:')
        );
      }
    }

    if (sendConfirmationToAdmin) {
      db.Notification.create({
        type: 'new published resource - admin update',
        projectId: req.project.id,
        data: {
          userId: req.user.id,
          resourceId: req.results.id,
        },
      }).catch(
        logNotificationError('Error sending admin notification for resource:')
      );
    }

    if (sendConfirmationToUser) {
      db.Notification.create({
        type: 'new published resource - user feedback',
        projectId: req.project.id,
        data: {
          userId: req.user.id,
          resourceId: req.results.id,
        },
      }).catch(
        logNotificationError('Error sending user notification for resource:')
      );
    }
  } else if (!req.query.nomail && !req.body['publishDate']) {
    if (sendConfirmationToUser) {
      db.Notification.create({
        type: 'new concept resource - user feedback',
        projectId: req.project.id,
        data: {
          userId: req.user.id,
          resourceId: req.results.id,
        },
      }).catch(
        logNotificationError('Error sending user notification for resource:')
      );
    }
  }

  if (!req.query.nomail && req.createdResource) {
    const newModBreaks = findNewModBreaks(
      new Set(),
      req.createdResource.modBreaks
    );
    sendModBreakNotifications({
      db,
      req,
      resource: req.createdResource,
      newModBreaks,
      changedModBreaks: [],
    });
  }
}

// ----------------------------------------------------------------------------
// Single resource  (/:resourceId)
// ----------------------------------------------------------------------------

function loadResource(req, res, next) {
  let resourceId = parseInt(req.params.resourceId) || 0;

  let scope = [...req.scope];
  if (req.canIncludeVoteCount) scope.push('includeVoteCount');

  db.Resource.scope(...scope)
    .findOne({
      where: { id: resourceId, projectId: req.params.projectId },
    })
    .then(async (found) => {
      if (!found) {
        return next(createError(404, 'Resource not found'));
      }
      found.project = req.project;
      stripHiddenVoteScore(found, req.canIncludeVoteCount);
      await attachModeratorOnlyExtraDataKeys(found);
      if (req.query.includeLinks) {
        found.links = await resourceLinks.listLinks({
          projectId: found.projectId,
          resourceId: found.id,
          user: req.user,
        });
      }
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
}

function checkResourceEditable(req, res, next) {
  if (!(
    req.project.config &&
    req.project.config.resources &&
    req.project.config.resources.canAddNewResources
  )) {
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
}

function captureTags(req, res, next) {
  req.tags = req.body.tags;
  next();
}

function detectChangedToPublished(req, res, next) {
  const currentResource = req.results.dataValues;
  const wasConcept = currentResource && !currentResource.publishDate;
  const willNowBePublished = req.body['publishDate'];
  req.changedToPublished = wasConcept && willNowBePublished;
  next();
}

function snapshotModBreaks(req, res, next) {
  req.previousModBreakIds = snapshotModBreakIds(req.results.modBreaks);
  req.previousModBreakDescriptions = snapshotModBreakDescriptions(
    req.results.modBreaks
  );
  next();
}

function updateResource(req, res, next) {
  var resource = req.results;

  if (!(resource && resource.can && resource.can('update')))
    return next(new Error('You cannot update this Resource'));

  try {
    captureLinkSelection(req);
  } catch (err) {
    return next(err);
  }

  if (req.body.location) {
    try {
      req.body.location = JSON.parse(req.body.location || null);
    } catch (err) {
      console.error('[resource-update] Could not parse location:', err.message);
    }

    if (
      req.body.location &&
      typeof req.body.location === 'object' &&
      !Object.keys(req.body.location).length
    ) {
      req.body.location = undefined;
    }
  } else {
    if (req.body.location === null) {
      req.body.location = null;
    }
  }

  let data = {
    ...req.body,
  };

  if (!hasRole(req.user, ['editor', 'moderator'])) {
    delete data.modBreaks;
  }

  if (data.images !== undefined && !canSetFocalPoint(req.user)) {
    data.images = stripFocalPoints(data.images);
  }

  const urlError = normalizeExtraDataUrl(data);
  if (urlError) return next(urlError);

  resource
    .authorizeData(data, 'update')
    .update(data)
    .then(async (result) => {
      result.project = req.project;
      await attachModeratorOnlyExtraDataKeys(result);
      req.results = result;
      next();
    })
    .catch(next);
}

async function updateResourceTags(req, res, next) {
  // tags
  let tags = req.body.tags;
  if (!Array.isArray(tags)) return next();

  if (!tags.every((t) => Number.isInteger(t))) {
    return next('Tags zijn niet gegeven in het juiste formaat');
  }

  const projectId = req.params.projectId;
  const canBeGlobal = req?.query?.includeGlobalTags === 'true';
  const tagEntities = await getValidTags(projectId, tags, canBeGlobal);

  const resourceInstance = req.results;
  resourceInstance
    .setTags(tagEntities)
    .then(() => {
      // refetch. now with tags
      let scope = [...req.scope, 'includeTags'];
      if (req.canIncludeVoteCount) scope.push('includeVoteCount');
      return db.Resource.scope(...scope)
        .findOne({
          where: { id: resourceInstance.id, projectId: req.params.projectId },
        })
        .then(async (found) => {
          if (!found) {
            return next(createError(404, 'Resource not found'));
          }

          if (req.query.includePoll) {
            // TODO: naar poll hooks
            if (found.poll) found.poll.countVotes(!req.query.includeVotes);
          }
          found.project = req.project;
          stripHiddenVoteScore(found, req.canIncludeVoteCount);
          await attachModeratorOnlyExtraDataKeys(found);
          req.results = found;
          next();
        })
        .catch(next);
    })
    .catch(next);
}

async function updateResourceStatuses(req, res, next) {
  // statuses
  let statuses = req.body.statuses;
  if (!Array.isArray(statuses)) return next();

  if (!statuses.every((t) => Number.isInteger(t))) {
    return next('Statuses zijn niet gegeven in het juiste formaat');
  }

  const projectId = req.params.projectId;
  const statusEntities = await getValidStatuses(projectId, statuses, req.user);

  const resourceInstance = req.results;
  resourceInstance
    .setStatuses(statusEntities)
    .then(() => {
      // refetch. now with statuses
      let scope = [...req.scope, 'includeStatuses'];
      if (req.canIncludeVoteCount) scope.push('includeVoteCount');
      return db.Resource.scope(...scope)
        .findOne({
          where: { id: resourceInstance.id, projectId: req.params.projectId },
        })
        .then(async (found) => {
          if (!found) {
            return next(createError(404, 'Resource not found'));
          }

          if (req.query.includePoll) {
            // TODO: naar poll hooks
            if (found.poll) found.poll.countVotes(!req.query.includeVotes);
          }
          found.project = req.project;
          stripHiddenVoteScore(found, req.canIncludeVoteCount);
          await attachModeratorOnlyExtraDataKeys(found);
          req.results = found;
          next();
        })
        .catch(next);
    })
    .catch(next);
}

async function sendUpdateNotifications(req, res, next) {
  const projectId = req.project?.id || Number(req.params.projectId);
  const sendUpdatedResourceEmail =
    await getUpdatedResourceEmailFlags(projectId);
  if (sendUpdatedResourceEmail.admin) {
    db.Notification.create({
      type: 'updated resource - admin update',
      projectId: req.project.id,
      data: {
        userId: req.user.id,
        resourceId: req.results.id,
      },
    }).catch(
      logNotificationError('Error sending admin notification for resource:')
    );
  }
  if (req.changedToPublished && req.results.userId) {
    db.Notification.create({
      type: 'new published resource - user feedback',
      projectId: req.project.id,
      data: {
        userId: req.results.userId,
        resourceId: req.results.id,
      },
    }).catch(
      logNotificationError('Error sending user notification for resource:')
    );
  }

  const newModBreaks = findNewModBreaks(
    req.previousModBreakIds,
    req.results?.modBreaks
  );
  const changedModBreaks = findChangedModBreaks(
    req.previousModBreakDescriptions,
    req.results?.modBreaks
  );

  const ownerGetsModBreakEmail =
    sendUpdatedResourceEmail.modBreakAuthor &&
    (newModBreaks.length > 0 || changedModBreaks.length > 0);

  if (
    sendUpdatedResourceEmail.user &&
    !req.changedToPublished &&
    !ownerGetsModBreakEmail &&
    req.results.userId
  ) {
    sendUpdatedResourceUserEmail(req).catch(
      logNotificationError('Error sending user notification for resource:')
    );
  }

  sendModBreakNotifications({
    db,
    req,
    newModBreaks,
    changedModBreaks,
  });

  next();
}

async function submitUpdateLinkRequests(req, res, next) {
  try {
    await submitLinkRequests(req, 'update');
    next();
  } catch (err) {
    next(err);
  }
}

function deleteResource(req, res, next) {
  const resource = req.results;
  if (!(resource && resource.can && resource.can('delete')))
    return next(new Error('You cannot delete this resource'));

  resource
    .destroy()
    .then(() => {
      res.json({ resource: 'deleted' });
    })
    .catch(next);
}

// ----------------------------------------------------------------------------
// Multiple resources  (/delete, /duplicate)
// ----------------------------------------------------------------------------

async function deleteMultipleResources(req, res, next) {
  let ids = req.body.ids;

  if (!ids || !Array.isArray(ids)) {
    return next(new Error('Invalid request: ids must be an array'));
  }

  ids = ids.filter((id) => Number.isInteger(id));
  if (ids.length === 0) {
    return next(new Error('Invalid request: no valid ids provided'));
  }

  try {
    const resources = await db.Resource.scope(...req.scope).findAll({
      where: { id: ids, projectId: req.params.projectId },
    });

    if (resources.length === 0) {
      return res
        .status(404)
        .json({ error: 'No resources found for the provided IDs' });
    }

    for (const resource of resources) {
      if (!resource.can || !resource.can('delete', req.user)) {
        return next(
          createError(403, `You cannot delete resource with ID ${resource.id}`)
        );
      }
    }

    await db.Resource.destroy({
      where: { id: resources.map((resource) => resource.id) },
    });

    res.json({ message: 'Resources deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function duplicateResources(req, res, next) {
  let ids = req.body.ids;
  const projectId = req.params.projectId;

  if (!ids || !Array.isArray(ids)) {
    return next(new Error('Invalid request: ids must be an array'));
  }

  ids = ids.filter((id) => Number.isInteger(id));
  if (ids.length === 0) {
    return next(new Error('Invalid request: no valid ids provided'));
  }

  try {
    req.scope.push('includeTags', 'includeStatuses');
    const resources = await db.Resource.scope(...req.scope).findAll({
      where: { id: ids, projectId: req.params.projectId },
    });

    if (resources.length === 0) {
      return res
        .status(404)
        .json({ error: 'No resources found for the provided IDs' });
    }

    for (const resource of resources) {
      if (!resource.can || !resource.can('create', req.user)) {
        return next(
          createError(
            403,
            `You cannot duplicate resource with ID ${resource.id}`
          )
        );
      }
    }

    const duplicatedResources = await Promise.all(
      resources.map(async (resource) => {
        const resourceData = resource.dataValues;
        const { id, createdAt, updatedAt, deletedAt, ...newResourceData } =
          resourceData;
        newResourceData.startDate = newResourceData.publishDate = new Date();

        let statuses = newResourceData.statuses || [];
        let tags = newResourceData.tags || [];

        tags = getOnlyIds(tags);
        statuses = getOnlyIds(statuses);

        let finalTags = [];
        if (Array.isArray(tags) && tags.length > 0) {
          finalTags = await getValidTags(projectId, tags, true);
        }

        let finalStatuses = [];
        if (Array.isArray(statuses) && statuses.length > 0) {
          finalStatuses = await getValidStatuses(projectId, statuses);
        }

        return db.Resource.create(newResourceData).then(async (result) => {
          if (Array.isArray(finalTags) && finalTags.length > 0) {
            await result.setTags(finalTags);
          }
          if (Array.isArray(finalStatuses) && finalStatuses.length > 0) {
            await result.setStatuses(finalStatuses);
          }

          return result;
        });
      })
    );

    res.json(duplicatedResources.map((resource) => resource.toJSON(req.user)));
  } catch (error) {
    next(error);
  }
}

function loadSharedResource(req, res, next) {
  let resourceId = parseInt(req.params.resourceId) || 0;

  db.Resource.scope(...req.scope)
    .findOne({
      where: { id: resourceId, projectId: req.params.projectId },
    })
    .then((found) => {
      if (!found) {
        return next(createError(404, 'Resource not found'));
      }
      found.project = req.project;
      if (!found.can || !found.can('view', req.user)) {
        return next(createError(404, 'Resource not found'));
      }
      req.resource = found;
      req.results = found;
      next();
    })
    .catch(next);
}

function respondSharedResource(req, res, next) {
  const resource = req.results;
  const images = Array.isArray(resource.images) ? resource.images : [];
  const imageUrls = images
    .map((image) => (image && image.url ? image.url : null))
    .filter(Boolean);

  res.json({
    id: resource.id,
    title: resource.title,
    summary: resource.summary,
    image: imageUrls[0] || null,
    images: imageUrls,
    url: (req.project && req.project.url) || null,
  });
}

module.exports = {
  setResourceScope,
  userhasModeratorRights,
  canSetFocalPoint,
  prepareCreateResourceData,
  // streets
  listStreets,
  // markers
  listMarkers,
  loadSharedResource,
  respondSharedResource,
  // list
  listResources,
  respondResults,
  // create
  requireProject,
  requireCanAddResources,
  createResource,
  stripStatusesIfCannotMutate,
  applyDefaultStatuses,
  applyDefaultTags,
  refetchCreatedResource,
  submitCreateLinkRequests,
  sendCreateNotifications,
  // single
  loadResource,
  checkResourceEditable,
  captureTags,
  detectChangedToPublished,
  snapshotModBreaks,
  updateResource,
  updateResourceTags,
  updateResourceStatuses,
  sendUpdateNotifications,
  submitUpdateLinkRequests,
  deleteResource,
  // multiple
  deleteMultipleResources,
  duplicateResources,
};
