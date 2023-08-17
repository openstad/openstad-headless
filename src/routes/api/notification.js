const express = require('express');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const router = express.Router({mergeParams: true});
const getSequelizeErrors = require('../../util/sequelize-validation');

router.route('/')
  .get(auth.can('NotificationTemplate', 'list'))

router.route('/template')
  .post(auth.can('NotificationTemplate', 'create'))
  .post(async (req, res, next) => {
    // Todo: validate request
    try {
      const data = {
        label: req.body.label,
        subject: req.body.subject,
        text: req.body.text,
        templateFile: req.body.templateFile,
      }

      const templateInstance = await db.NotificationTemplate
        .authorizeData(data, 'create', req.user, null, req.project)
        .create(data);

      const result = await db.NotificationTemplate
        .findByPk(templateInstance.id);

      return res.status(201).json(result.get({plain: true}));
    } catch (error) {
      const sequelizeErrors = getSequelizeErrors(error)
      if (sequelizeErrors.length > 0) {
        res.status(422).json(sequelizeErrors);
      } else {
        next(error);
      }
    }
  })
  .put(async (req, res, next) => {
    // Todo: validate request
    try {
      const data = {
        label: req.body.label,
        subject: req.body.subject,
        text: req.body.text,
        templateFile: req.body.templateFile,
      }

      const template = await db.NotificationTemplate
        .findByPk(req.body.id);

      const templateInstance = await template
        .authorizeData(data, 'update', req.user, null, req.project)
        .update(data);

      const result = await db.NotificationTemplate
        .findByPk(templateInstance.id);

      return res.status(201).json(result.get({plain: true}));
    } catch (error) {
      const sequelizeErrors = getSequelizeErrors(error)
      if (sequelizeErrors.length > 0) {
        res.status(422).json(sequelizeErrors);
      } else {
        next(error);
      }
    }
  })
  .get(async (req, res, next) => {
    const query = {
      where: {}
    };
    if (req.query.label) {
      query.where.label = req.query.label
    }

    if (req.query.includeRecipient) {
      scopes.push('includeRecipients')
    }

    const results = await db.NotificationTemplate
      .findAll(query);

    res.status(200).json(results.map(result => result.get({plain: true})));
  })

router.route('/template/:id(\\d+)')
  .delete(auth.can('NotificationTemplate', 'delete'))
  .delete(async (req, res, next) => {
    try {
      const template = await db.NotificationTemplate
        .findByPk(req.params.id);

      await template.destroy()
      res.json({ 'template': 'deleted' });
    } catch(error) {
      next();
    }
  });

router.route('/ruleset')
  .get(async (req, res, next) => {
    const query = {
      where: {
        projectId: parseInt(req.params.projectId),
      }
    };
    if (req.query.label) {
      query.where.label = req.query.label
    }

    const scopes = ['includeTemplate', 'includeRecipients'];
    const applicableScopes = scopes.filter(scope => req.query[scope])

    const results = await db.NotificationRuleSet
      .scope(...applicableScopes)
      .findAll(query);

    res.status(200).json(results.map(result => result.get({plain: true})));
  })
  .post(auth.can('NotificationRuleSet', 'create'))
  .post(async (req, res, next) => {

    // Todo: validate request
    try {
      const data = {
        notificationTemplateId: req.body.notificationTemplateId,
        projectId: req.params.projectId,
        active: req.body.active,
        label: req.body.label,
        body: req.body.body
      }
      const ruleSetInstance = await db.NotificationRuleSet
        .authorizeData(data, 'create', req.user, null, req.project)
        .create(data);

      const result = await db.NotificationRuleSet
        .findByPk(ruleSetInstance.id);

      res.status(201).json(result.get({plain: true}));
    } catch (error) {
      const sequelizeErrors = getSequelizeErrors(error)
      if (sequelizeErrors.length > 0) {
        res.status(422).json(sequelizeErrors);
      } else {
        next(error);
      }
    }
  })
  .put(async (req, res, next) => {
    try {
      const data = {
        notificationTemplateId: req.body.notificationTemplateId,
        projectId: req.params.projectId,
        active: req.body.active,
        label: req.body.label,
        body: req.body.body
      };

      const ruleSet = await db.NotificationRuleSet
        .findByPk(req.body.id);

      const ruleSetInstance = await ruleSet
        .authorizeData(data, 'update', req.user, null, req.project)
        .update(data);

      const result = await db.NotificationRuleSet
        .findByPk(ruleSetInstance.id);

      return res.status(200).json(result.get({plain: true}));
    } catch (error) {
      const sequelizeErrors = getSequelizeErrors(error)
      if (sequelizeErrors.length > 0) {
        res.status(422).json(sequelizeErrors);
      } else {
        next(error);
      }
    }
  })

router.route('/ruleset/:id(\\d+)')
  .delete(auth.can('NotificationRuleSet', 'delete'))
  .delete(async (req, res, next) => {
    try {
      const ruleSet = await db.NotificationRuleSet
        .findByPk(parseInt(req.params.id));

      await ruleSet.destroy()

      res.json({ 'ruleset': 'deleted' });
    } catch(error) {
      console.error(error)
      next();
    }
  });

router.route('/recipient')
  .post(auth.can('NotificationRecipient', 'create'))
  .post(async (req, res, next) => {

    // Todo: validate request
    try {
      const data = {
        notificationRulesetId: req.body.notificationRulesetId,
        emailType: req.body.emailType,
        value: req.body.value
      }

      const recipientInstance = await db.NotificationRecipient
        .authorizeData(data, 'create', req.user, null, req.project)
        .create(data);

      const result = await db.NotificationRecipient
        .findByPk(recipientInstance.id);

      res.status(201).json(result.get({plain: true}));
    } catch (error) {
      const sequelizeErrors = getSequelizeErrors(error)
      if (sequelizeErrors.length > 0) {
        res.status(422).json(sequelizeErrors);
      } else {
        next(error);
      }
    }
  })
  .put(async (req, res, next) => {
    try {
      const data = {
        notificationRulesetId: req.body.notificationRulesetId,
        emailType: req.body.emailType,
        value: req.body.value
      }

      const recipient = await db.NotificationRecipient
        .findByPk(req.body.id);

      const recipientInstance = await recipient
        .authorizeData(data, 'update', req.user, null, req.project)
        .update(data);

      const result = await db.NotificationRecipient
        .findByPk(recipientInstance.id);

      return res.status(201).json(result.get({plain: true}));
    } catch (error) {
      const sequelizeErrors = getSequelizeErrors(error)
      if (sequelizeErrors.length > 0) {
        res.status(422).json(sequelizeErrors);
      } else {
        next(error);
      }
    }
  })

router.route('/recipient/:id(\\d+)')
  .delete(auth.can('NotificationRecipient', 'delete'))
  .delete(async (req, res, next) => {
    try {
      const recipient = await db.NotificationRecipient
        .findByPk(req.params.id);
      await recipient.destroy()
      res.json({ 'recipient': 'deleted' });
    } catch(error) {
      next();
    }
  });

module.exports = router;
