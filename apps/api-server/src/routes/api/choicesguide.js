const express = require('express');
const createError = require('http-errors');
const { Op, Sequelize } = require('sequelize');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const crypto = require('crypto');
const {
  analyzeSpamPayload,
  isSpamFilterEnabled,
  logSpamAnalysis,
  removeSpamMetaFields,
} = require('../../services/spam-detector');

const router = express.Router({ mergeParams: true });

// ================================================================================
// choicesguide results
// ================================================================================

router
  .route(
    '/:choicesGuideId(\\d+)(/questiongroup/:questionGroupId(\\d+))?/result$'
  )
  .all(function (req, res, next) {
    req.scope = [{ method: ['forProjectId', req.project.id] }];
    return next();
  })
  .all(function (req, res, next) {
    let choicesGuideId = parseInt(req.params.choicesGuideId);
    if (!choicesGuideId) throw createError(404, 'choicesGuide not found');
    db.ChoicesGuide.scope(...req.scope)
      .findOne({
        where: { id: choicesGuideId, projectId: req.project.id },
      })
      .then((found) => {
        if (!found) throw createError(404, 'choicesGuide not found');
        found.project = req.project;
        req.choicesguide = found;
        next();
      })
      .catch(next);
  })

  // list results
  // ------------

  .get(auth.can('ChoicesGuideResult', 'list'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    let where = { choicesGuideId: req.choicesguide.id };
    let choicesGuideQuestionGroupId = parseInt(
      req.params.choicesGuideQuestionGroupId
    );
    if (choicesGuideQuestionGroupId)
      where.questionGroupId = choicesGuideQuestionGroupId;
    db.ChoicesGuideResult.scope(...req.scope)
      .findAll({ where })
      .then((found) => {
        return found.map((entry) => {
          let json = {
            id: entry.id,
            userId: entry.id,
            extraData: entry.extraData,
            userFingerprint: entry.userFingerprint,
            result: entry.result,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          };
          return json;
        });
      })
      .then(function (found) {
        res.json(found);
      })
      .catch(next);
  });

router
  .route('/widgets')
  .get(auth.can('ChoicesGuide', 'list'))
  .get(function (req, res, next) {
    db.Widget.findAll({
      attributes: ['id', 'description'],
      where: {
        projectId: req.params.projectId,
        type: 'choiceguide',
      },
    })
      .then((found) => {
        res.json(found);
      })
      .catch(next);
  });

router
  .route('/widgets/:widgetId(\\d+)/count')
  .get(auth.can('ChoicesGuide', 'list'))
  .get(function (req, res, next) {
    const widgetId = parseInt(req.params.widgetId);
    if (!widgetId) return next(createError(404, 'Widget not found'));

    db.ChoicesGuideResult.count({
      where: {
        widgetId,
        projectId: req.params.projectId,
      },
    })
      .then((count) => {
        res.json({ count });
      })
      .catch(next);
  });

router
  .route('/')
  // list choicesguide result
  // --------------

  .get(auth.can('ChoicesGuideResult', 'list'))
  .get(auth.useReqUser)
  .get(async function (req, res, next) {
    let where = {};
    req.scope = ['defaultScope'];

    if (req.query && req.query.includeUser) {
      req.scope.push('includeUser');
    }

    if (req.params && req.params.projectId) {
      req.scope.push({ method: ['forProjectId', req.params.projectId] });
    }

    const { page = 0, limit = 50, widgetId } = req.query;

    if (widgetId) {
      where.widgetId = widgetId;
    }

    let search = req.query.search;
    if (search) {
      if (!Array.isArray(search)) search = [search];
      const criteria = search[0] || {};
      const field = Object.keys(criteria)[0];
      const value =
        field && typeof criteria[field] === 'string'
          ? criteria[field].trim()
          : '';

      if (field && value) {
        if (field === 'widgetId' || field === 'userId' || field === 'id') {
          const exactNumber = parseInt(value, 10);
          if (!Number.isNaN(exactNumber)) {
            where[field] = exactNumber;
          }
        } else if (field === 'createdAt') {
          where[Op.and] = [
            ...(Array.isArray(where[Op.and]) ? where[Op.and] : []),
            Sequelize.where(
              Sequelize.cast(Sequelize.col('createdAt'), 'CHAR'),
              { [Op.like]: `%${value}%` }
            ),
          ];
        } else if (field === 'result') {
          where[Op.and] = [
            ...(Array.isArray(where[Op.and]) ? where[Op.and] : []),
            Sequelize.where(Sequelize.cast(Sequelize.col('result'), 'CHAR'), {
              [Op.like]: `%${value}%`,
            }),
          ];
        } else if (field === 'text') {
          where[Op.or] = [
            Sequelize.where(Sequelize.cast(Sequelize.col('widgetId'), 'CHAR'), {
              [Op.like]: `%${value}%`,
            }),
            Sequelize.where(Sequelize.cast(Sequelize.col('userId'), 'CHAR'), {
              [Op.like]: `%${value}%`,
            }),
            Sequelize.where(
              Sequelize.cast(Sequelize.col('createdAt'), 'CHAR'),
              { [Op.like]: `%${value}%` }
            ),
            Sequelize.where(Sequelize.cast(Sequelize.col('result'), 'CHAR'), {
              [Op.like]: `%${value}%`,
            }),
          ];
        }
      }
    }

    try {
      const result = await db.ChoicesGuideResult.scope(
        ...req.scope
      ).findAndCountAll({
        where,
        offset: page * limit,
        limit: parseInt(limit),
        order: req.dbQuery.order,
      });

      req.results = await Promise.all(
        result.rows.map(async (entry) => {
          const widget = await db.Widget.findOne({
            where: { id: entry.widgetId, projectId: req.params.projectId },
          });
          return {
            ...entry.toJSON(),
            widgetConfig: widget ? widget.config : null,
            user: entry.user || null,
          };
        })
      );

      req.dbQuery.count = result.count;
      return next();
    } catch (error) {
      return next(error);
    }
  })
  .get(function (req, res, next) {
    res.json({
      data: req.results,
      pagination: {
        page: req.dbQuery.page,
        totalPages: req.dbQuery.totalPages,
        totalCount: req.dbQuery.count,
      },
    });
  })

  // create choicesguide result
  // --------------------------------
  .post(auth.can('ChoicesGuideResult', 'create'))
  .post(function (req, res, next) {
    if (!req.project) return next(createError(401, 'Project niet gevonden'));
    return next();
  })
  .post(rateLimiter(), function (req, res, next) {
    const sanitizedSubmittedData = removeSpamMetaFields(
      req.body.submittedData || {}
    );
    let isSpamSubmission = false;
    if (isSpamFilterEnabled()) {
      const analysis = analyzeSpamPayload(req.body.submittedData || {}, {
        withDetails: true,
      });
      logSpamAnalysis({ routeName: 'choicesguide', req, analysis });
      isSpamSubmission = analysis.isProbablySpam;
    }

    let data = {
      userId: req.user && req.user.id,
      result: sanitizedSubmittedData,
      widgetId: req.body.widgetId,
      projectId: req.params.projectId,
      isSpam: isSpamSubmission,
      createdAt: new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })
      ),
    };

    if (process.env.HASH_IP_ADDRESSES === 'true' && process.env.HASH_IP_SALT) {
      const ipSalt = process.env.HASH_IP_SALT;

      const hash = crypto.createHash('md5');

      hash.update(req.ip + ipSalt);
      const hashedIp = hash.digest('hex');

      data.result.ipAddress = hashedIp;
    }

    db.ChoicesGuideResult.authorizeData(
      data,
      'create',
      req.user,
      null,
      req.project
    )
      .create(data)
      .then((result) => {
        res.json(result);
      })
      .catch(next);
  });

// bulk delete choiceguide results
// ---------
router
  .route('/delete')
  .delete(auth.can('ChoicesGuideResult', 'delete'))
  .delete(function (req, res, next) {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(createError(400, 'No ids provided'));
    }
    db.ChoicesGuideResult.destroy({
      where: { id: ids, projectId: req.params.projectId },
    })
      .then((count) => {
        res.json({
          message: `${count} ChoiceGuide result(s) deleted successfully.`,
        });
      })
      .catch(next);
  });

// delete choiceguide result
// ---------
router
  .route('/:choicesGuideId(\\d+)')
  .delete(auth.can('ChoicesGuideResult', 'delete'))
  .delete(function (req, res, next) {
    const { choicesGuideId } = req.params;
    db.ChoicesGuideResult.destroy({
      where: { id: choicesGuideId },
    })
      .then(() => {
        res.json({ message: 'ChoiceGuide result deleted successfully.' });
      })
      .catch(next);
  });

module.exports = router;
