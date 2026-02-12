const createError = require('http-errors');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const express = require('express');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const crypto = require('crypto');
const router = express.Router({ mergeParams: true });

// scopes: for all get requests
router
  .all('*', function (req, res, next) {
    req.scope = ['defaultScope', 'includeResource'];
    req.scope.push({ method: ['forProjectId', req.params.projectId] });

    if (req.query.includeRepliesOnComments) {
      req.scope.push('includeRepliesOnComments');
      req.scope.push({ method: ['includeRepliesOnComments', req.user.id] });
    }

    if (req.query.includeTags) {
      req.scope.push('includeTags');
    }

    if (req.query.includeAllComments) {
      req.scope.push('includeAllComments');
    }

    if (req.query.includeVoteCount) {
      req.scope.push({ method: ['includeVoteCount', 'comment'] });
    }

    if (req.query.includeUserVote) {
      req.scope.push({ method: ['includeUserVote', 'comment', req.user.id] });
    }

    return next();
  })
  .all('*', function (req, res, next) {
    // zoek het resource
    // todo: ik denk momenteel alleen nog gebruikt door create; dus zet hem daar neer
    let resourceId = parseInt(req.params.resourceId) || 0;
    if (!resourceId) return next();
    db.Resource.scope('includeProject')
      .findByPk(resourceId)
      .then((resource) => {
        if (!resource || resource.projectId != req.params.projectId)
          return next(createError(400, 'Resource not found'));
        req.resource = resource;
        return next();
      });
  })
  .all('/:commentId(\\d+)(/vote)?(/yes|/no)?', function (req, res, next) {
    // include one existing comment
    // --------------------------

    var commentId = parseInt(req.params.commentId) || 1;

    let sentiment = req.query.sentiment;
    let where = { id: commentId };

    if (
      sentiment &&
      (sentiment == 'against' ||
        sentiment == 'for' ||
        sentiment == 'no sentiment')
    ) {
      where.sentiment = sentiment;
    }

    db.Comment.scope(...req.scope)
      .findOne({
        where,
      })
      .then((entry) => {
        if (!entry) throw new Error('Comment not found');
        req.results = entry;
        return next();
      })
      .catch(next);
  });

router
  .route('/')

  // list comments
  // --------------
  .get(auth.can('Comment', 'list'))
  .get(pagination.init)
  .get(function (req, res, next) {
    let { dbQuery } = req;

    let resourceId = parseInt(req.params.resourceId) || 0;
    let where = {};
    if (resourceId) {
      where.resourceId = resourceId;
    }
    let sentiment = req.query.sentiment;
    if (
      sentiment &&
      (sentiment == 'against' ||
        sentiment == 'for' ||
        sentiment == 'no sentiment')
    ) {
      where.sentiment = sentiment;
    }

    let onlyIncludeTagIds = req.query.onlyIncludeTagIds || '';

    req.scope.push({ method: ['filterByTags', onlyIncludeTagIds] });

    return db.Comment.scope(...req.scope)
      .findAndCountAll({
        where,
        ...dbQuery,
      })
      .then(function (result) {
        req.results = result.rows;
        req.dbQuery.count = result.count;
        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(
    searchInResults({
      searchfields: ['description', 'user.name', 'replies.description'],
    })
  )
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // create comment
  // ---------------
  .post(auth.can('Comment', 'create'))
  .post(auth.useReqUser)
  .post(function (req, res, next) {
    if (!req.resource) return next(createError(400, 'Inzending niet gevonden'));
    if (!req.resource.auth.canComment(req.resource))
      return next(createError(400, 'Je kunt niet reageren op deze inzending'));
    return next();
  })
  .post(function (req, res, next) {
    if (!req.body.parentId) return next();
    db.Comment.scope('defaultScope', 'includeResource')
      .findByPk(req.body.parentId)
      .then(function (comment) {
        req.parentComment = comment;
        if (!(comment && comment.can && comment.can('reply', req.user)))
          return next(new Error('You cannot reply to this comment'));
        return next();
      });
  })
  .post(rateLimiter(), function (req, res, next) {
    let userId = req.user.id;
    if (hasRole(req.user, 'admin') && req.body.userId) userId = req.body.userId;

    let data = {
      ...req.body,
      resourceId: req.params.resourceId,
      userId,
    };

    req.confirmation = data.confirmation || false;
    req.confirmationReplies = data.confirmationReplies || false;
    req.overwriteEmailAddress = data.overwriteEmailAddress || '';
    req.embeddedUrl = data.embeddedUrl || '';

    delete data.confirmation;
    delete data.confirmationReplies;
    delete data.overwriteEmailAddress;
    delete data.embeddedUrl;

    db.Comment.authorizeData(data, 'create', req.user)
      .create(data)
      .then(async (result) => {
        // Handle tags
        let tags = req.body.tags || [];
        if (!Array.isArray(tags)) tags = [tags];
        tags = tags.filter((tag) => !Number.isNaN(parseInt(tag)));
        tags = tags.map((tag) => parseInt(tag));
        tags = tags.filter((value, index) => tags.indexOf(value) === index);
        if (tags.length) {
          await result.setTags(tags);
        }

        const scopes = [
          'defaultScope',
          'includeResource',
          { method: ['includeVoteCount', 'comment'] },
          { method: ['includeUserVote', 'comment', req.user.id] },
        ];

        db.Comment.scope(...scopes)
          .findByPk(result.id)
          .then(function (comment) {
            req.results = comment;
            next();
          })
          .catch(next);
      })
      .catch(next);
  })
  .post(async function (req, res, next) {
    const confirmation = req.confirmation;
    const confirmationReplies = req.confirmationReplies;
    const overwriteEmailAddress = req.overwriteEmailAddress;

    let receiver = '';
    let receiverUserId = 0;
    let receiverProjectId = 0;
    let parentComment = '';
    let confirmationSent = undefined;
    let type = '';

    if (confirmation && !req?.results?.parentId) {
      if (overwriteEmailAddress) {
        receiver = overwriteEmailAddress;
      } else if (req.results && req.results.resourceId) {
        const resource = await db.Resource.findByPk(req.results.resourceId);
        if (resource && resource.userId) {
          const user = await db.User.findByPk(resource.userId);
          if (user && user.email && user.emailNotificationConsent) {
            receiver = user.email;
            receiverUserId = user.id;
            receiverProjectId = user.projectId;
          } else {
            confirmationSent = false;
          }
        }
      }
    } else if (confirmationReplies) {
      const parentId = req.results.parentId;
      if (parentId) {
        const parentUserId = req?.parentComment?.user?.id || null;
        const parentUser = parentUserId
          ? await db.User.findByPk(parentUserId)
          : null;

        if (
          parentUser &&
          parentUser.emailNotificationConsent &&
          parentUser.email
        ) {
          receiver = parentUser.email;
          receiverUserId = parentUser.id;
          receiverProjectId = parentUser.projectId;
          parentComment = req?.parentComment?.description;
        } else {
          confirmationSent = false;
        }
      }
    }

    if (!!receiver) {
      const userIdSalt = process.env.USER_ID_SALT;

      const hash = crypto.createHash('md5');
      hash.update(`${userIdSalt}.${receiverUserId}.${receiverProjectId}`);
      const hashedUserId = hash.digest('hex');

      const commentData = {
        comment: {
          description: req.results.description,
          sentiment: req.results.sentiment,
          parentId: req.results.parentId,
          createDateHumanized: req.results.createDateHumanized,
          userName: req.results.user ? req.results.user.displayName : '',
          userEmail: req.results.user ? req.results.user.email : '',
        },
        unsubscribeUrl: receiverUserId
          ? `${process.env.URL}/api/project/${receiverProjectId}/user/unsubscribe/${receiverUserId}/${hashedUserId}`
          : '',
        embeddedUrl: req.embeddedUrl || '',
      };

      if (!!parentComment) {
        commentData.comment.parentComment = parentComment;
      }

      try {
        const notificationType =
          confirmation && !req?.results?.parentId
            ? 'notification comment - user'
            : confirmationReplies
              ? 'notification comment reply - user'
              : '';

        if (!notificationType) throw new Error('No valid notification type');

        db.Notification.create({
          type: notificationType,
          projectId: req.project.id,
          to: receiver,
          data: commentData,
        });
        confirmationSent = true;
      } catch (e) {
        console.log('Error sending notification email for comment:', e);
      }
    }

    req.results.confirmationSent = confirmationSent;
    res.json(req.results);
  });

// bulk delete comments
// ---------
router
  .route('/delete')
  .delete(auth.can('Comment', 'delete'))
  .delete(async function (req, res, next) {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(createError(400, 'No ids provided'));
    }
    try {
      const comments = await db.Comment.scope('defaultScope', {
        method: ['forProjectId', req.params.projectId],
      }).findAll({ where: { id: ids } });

      for (const comment of comments) {
        await comment.destroy();
        const childComments = await db.Comment.findAll({
          where: { parentId: comment.id },
        });
        for (const childComment of childComments) {
          await childComment.destroy();
        }
      }

      res.json({
        message: `${comments.length} comment(s) deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  });

router
  .route('/:commentId(\\d+)')

  // view comment
  // -------------
  .get(auth.can('Comment', 'view'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // update comment
  // ---------------
  .put(auth.useReqUser)
  .put(rateLimiter(), function (req, res, next) {
    var comment = req.results;
    if (!(comment && comment.can && comment.can('update')))
      return next(new Error('You cannot update this comment'));
    comment
      .authorizeData(req.body, 'update')
      .update(req.body)
      .then(async (result) => {
        if (!comment.location && !comment.parentId) {
          let tags = req.body.tags || [];
          if (!Array.isArray(tags)) tags = [tags];
          tags = tags.filter((tag) => !Number.isNaN(parseInt(tag)));
          tags = tags.map((tag) => parseInt(tag));
          tags = tags.filter((value, index) => tags.indexOf(value) === index);
          await result.setTags(tags);
        }

        res.json(result);
      })
      .catch(next);
  })

  // delete comment
  // --------------
  .delete(auth.useReqUser)
  .delete(async function (req, res, next) {
    const comment = req.results;
    if (!(comment && comment.can && comment.can('delete')))
      return next(new Error('You cannot delete this comment'));

    try {
      await comment.destroy();

      const childComments = await db.Comment.findAll({
        where: { parentId: comment.id },
      });
      for (const childComment of childComments) {
        await childComment.destroy();
      }

      res.json({ comment: 'deleted', replies: 'deleted' });
    } catch (err) {
      next(err);
    }
  });

router
  .route('/:commentId(\\d+)/vote/:opinion(yes|no)?')

  // vote for comment
  // -----------------

  .post(auth.useReqUser)
  .post(function (req, res, next) {
    var user = req.user;
    var comment = req.results;
    const opinion = req.params.opinion || 'yes';

    if (!(comment && comment.can && comment.can('vote')))
      return next(new Error('You cannot vote for this comment'));

    comment
      .addUserVote(user, req.ip, opinion)
      .then(function (voteRemoved) {
        db.Comment.scope(
          'defaultScope',
          'includeResource',
          { method: ['includeVoteCount', 'comment'] },
          { method: ['includeUserVote', 'comment', req.user.id] }
        )
          .findByPk(comment.id)
          .then(function (comment) {
            req.results = comment;
            return next();
          });
      })
      .catch(next);
  })
  .post(function (req, res, next) {
    res.json(req.results);
    // setTimeout(function() {
    //   res.json(req.results);
    // }, 1000)
  });

module.exports = router;
