const express = require('express');
const config = require('config');
const merge = require('merge');
const Sequelize = require('sequelize');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
// TODO-AUTH
const checkHostStatus = require('../../services/checkHostStatus');
const projectsWithIssues = require('../../services/projects-with-issues');
const externalCertificatesManager = require('../../services/externalCertificatesManager');
const externalCertificates = require('../../services/externalCertificates');
const {
  getCertificateConfig,
} = require('../../services/checkHostStatusHelpers');
const authSettings = require('../../util/auth-settings');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const removeProtocolFromUrl = require('../../middleware/remove-protocol-from-url');
const messageStreaming = require('../../services/message-streaming');
const service = require('../../adapter/openstad/service');
const {
  normalizeConfigForOpenstadClientSync,
} = require('../../util/project-duplication-auth');
const {
  createDuplicateRollbackSessionStore,
} = require('../../util/duplicate-rollback-session');
const fs = require('fs');
const getWidgetSettings = require('./../widget/widget-settings');
const widgetDefinitions = getWidgetSettings();
const createError = require('http-errors');

let router = express.Router({ mergeParams: true });
const { Op } = require('sequelize');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');

// In-memory cooldown map for certificate retry (projectId -> lastTriggerTime)
const certRetryCooldowns = new Map();
const CERT_RETRY_COOLDOWN_MS =
  (parseInt(process.env.EXTERNAL_CERT_RETRY_COOLDOWN) || 60) * 1000;
const DUPLICATE_ROLLBACK_SESSION_TTL_MS = 60 * 60 * 1000;
const duplicateRollbackSessionStore = createDuplicateRollbackSessionStore({
  projectModel: db.Project,
  ttlMs: DUPLICATE_ROLLBACK_SESSION_TTL_MS,
});

async function buildAuthProviderSyncConfig({
  sourceProject,
  fallbackProviderConfig = {},
}) {
  const providerConfigForSync = merge.recursive(
    {},
    fallbackProviderConfig || {}
  );
  if (!sourceProject) return providerConfigForSync;

  const providers = await authSettings.providers({
    project: sourceProject,
    useOnlyDefinedOnProject: true,
  });

  for (const provider of providers) {
    const authConfig = await authSettings.config({
      project: sourceProject,
      useAuth: provider,
    });
    const adapter = await authSettings.adapter({ authConfig });
    const base = providerConfigForSync[provider] || {};

    if (adapter.service.fetchClient) {
      const client = await adapter.service.fetchClient({
        authConfig,
        project: sourceProject,
      });
      providerConfigForSync[provider] = {
        ...base,
        config: client?.config || base.config || {},
        authTypes: client?.authTypes || base.authTypes,
        requiredUserFields:
          client?.requiredUserFields || base.requiredUserFields,
        twoFactorRoles: client?.twoFactorRoles || base.twoFactorRoles,
        allowedDomains: client?.allowedDomains || base.allowedDomains,
      };
    } else {
      providerConfigForSync[provider] = base;
    }
  }

  return providerConfigForSync;
}

async function canUserUseSourceProjectForDuplication({ req, sourceProjectId }) {
  if (!sourceProjectId) return true;
  if (hasRole(req.user, 'superuser')) return true;

  const identifier = req.user?.idpUser?.identifier;
  const provider = req.user?.idpUser?.provider;
  if (!identifier || !provider) return false;

  const sourceProjectUser = await db.User.findOne({
    where: {
      projectId: sourceProjectId,
      idpUser: { identifier, provider },
      [Op.or]: [{ role: 'admin' }, { role: 'editor' }],
    },
  });

  return !!sourceProjectUser;
}

async function getProject(req, res, next, include = []) {
  const projectId = req.params.projectId;
  let query = { where: { id: parseInt(projectId) }, include: include };
  try {
    let project = await db.Project.scope(req.scope).findOne(query);
    if (!project) throw new Error('Project not found');
    req.results = project;
    req.project = req.results; // middleware expects this to exist
    // include authconfig
    if (req.query.includeAuthConfig && hasRole(req.user, 'admin')) {
      let providers = await authSettings.providers({ project });
      for (let provider of providers) {
        if (provider == 'default') continue;
        let authConfig = await authSettings.config({
          project,
          useAuth: provider,
        });
        let adapter = await authSettings.adapter({ authConfig });
        if (adapter.service.fetchClient && authConfig.clientId) {
          let client = await adapter.service.fetchClient({
            authConfig,
            project,
          });
          project.config.auth.provider[provider].name = client.name;
          project.config.auth.provider[provider].description =
            client.description;
          project.config.auth.provider[provider].siteUrl = client.siteUrl;
          project.config.auth.provider[provider].authTypes = client.authTypes;
          project.config.auth.provider[provider].requiredUserFields =
            client.requiredUserFields;
          project.config.auth.provider[provider].twoFactorRoles =
            client.twoFactorRoles;
          project.config.auth.provider[provider].allowedDomains =
            client.allowedDomains;
          project.config.auth.provider[provider].config = client.config;
          project.config.auth.provider[provider].authTypeDefaults =
            client.authTypeDefaults;
          project.config.auth.provider[provider].client = client;
        }
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// Function to create tags
async function createTags(req, tagMap, errors) {
  for (const tag of req.tags) {
    try {
      const newTag = await db.Tag.create({ ...tag, projectId: req.projectId });
      tagMap[tag.originalId] = newTag.id;
    } catch (error) {
      errors.push({ step: 'Create tags', error: error.message });
    }
  }
}

// Function to create statuses
async function createStatuses(req, statusMap, errors) {
  for (const status of req.statuses) {
    try {
      const newStatus = await db.Status.create({
        ...status,
        projectId: req.projectId,
      });
      statusMap[status.originalId] = newStatus.id;
    } catch (error) {
      errors.push({ step: 'Create statuses', error: error.message });
    }
  }
}

// Function to create notification templates
async function createNotificationTemplates(req, errors) {
  for (const template of req.notificationTemplates) {
    try {
      // eslint-disable-next-line no-unused-vars
      const { originalId, ...templateData } = template;
      // Skip afterCreate hooks: auth client sync is already handled by the
      // auth provider sync earlier in the duplication flow.
      await db.NotificationTemplate.create(
        { ...templateData, projectId: req.projectId },
        { hooks: false }
      );
    } catch (error) {
      errors.push({
        step: 'Create notification templates',
        error: error.message,
      });
    }
  }
}

// Function to create widgets
async function createWidgets(req, widgetMap, newWidgets, errors) {
  for (const widget of req.widgets) {
    try {
      const newWidget = await db.Widget.create({
        ...widget,
        projectId: req.projectId,
      });
      widgetMap[widget.originalId] = newWidget.id;
      newWidgets.push(newWidget);
    } catch (error) {
      errors.push({ step: 'Create widgets', error: error.message });
    }
  }
}

// Function to get or create a user
async function getOrCreateUser(userId, userMap, projectId, createdUserIds) {
  const mapKey = String(userId);
  if (userMap[mapKey]) {
    return userMap[mapKey];
  }

  const normalizedUserId =
    typeof userId === 'number' && Number.isInteger(userId)
      ? userId
      : typeof userId === 'string' && /^\d+$/.test(userId)
        ? parseInt(userId, 10)
        : null;
  const user =
    normalizedUserId === null
      ? null
      : await db.User.findOne({ where: { id: normalizedUserId }, raw: true });

  const findExistingByIdpUser = async (idpUser) => {
    if (!idpUser || !idpUser.identifier || !idpUser.provider) return null;

    return db.User.findOne({
      where: Sequelize.and(
        {
          idpUser: {
            identifier: idpUser.identifier,
            provider: idpUser.provider,
          },
        },
        { projectId }
      ),
    });
  };

  if (!user) {
    const anonymousIdentity = {
      provider: 'anonymous',
      identifier: 'anonymous',
    };
    const existingAnonymousUser =
      await findExistingByIdpUser(anonymousIdentity);
    if (existingAnonymousUser) {
      userMap[mapKey] = existingAnonymousUser.id;
      return existingAnonymousUser.id;
    }

    const newAnonymousUser = await db.User.create({
      idpUser: anonymousIdentity,
      projectId,
    });
    userMap[mapKey] = newAnonymousUser.id;
    if (createdUserIds) createdUserIds.add(newAnonymousUser.id);
    return newAnonymousUser.id;
  }

  const existingUser = await findExistingByIdpUser(user.idpUser);
  if (existingUser) {
    userMap[mapKey] = existingUser.id;
    return existingUser.id;
  }

  delete user.id;
  user.projectId = projectId;
  const newUser = await db.User.create(user);

  userMap[mapKey] = newUser.id;
  if (createdUserIds) createdUserIds.add(newUser.id);
  return newUser.id;
}

// Function to create resources
async function createResources(
  req,
  resourceMap,
  widgetMap,
  tagMap,
  statusMap,
  userMap,
  errors
) {
  for (const resource of req.resources) {
    try {
      const updateWidgetIds = (singleResource) => {
        for (const key in singleResource) {
          if (
            typeof singleResource[key] === 'object' &&
            singleResource[key] !== null
          ) {
            updateWidgetIds(singleResource[key]);
          } else if (key === 'widgetId') {
            singleResource[key] = widgetMap[singleResource[key]];
          }
        }
        return singleResource;
      };

      const updatedResource = updateWidgetIds(resource);

      // Remap the top-level resource.userId.
      const sourceResourceUserId = updatedResource.userId;
      if (
        sourceResourceUserId !== null &&
        sourceResourceUserId !== undefined &&
        sourceResourceUserId !== ''
      ) {
        updatedResource.userId = await getOrCreateUser(
          sourceResourceUserId,
          userMap,
          req.projectId,
          req.createdUserIds
        );
      }

      // Remap known top-level secondary user reference.
      const sourceModBreakUserId = updatedResource.modBreakUserId;
      if (
        typeof sourceModBreakUserId === 'number' ||
        (typeof sourceModBreakUserId === 'string' &&
          /^\d+$/.test(sourceModBreakUserId))
      ) {
        const normalizedSourceModBreakUserId =
          typeof sourceModBreakUserId === 'number'
            ? sourceModBreakUserId
            : parseInt(sourceModBreakUserId, 10);
        updatedResource.modBreakUserId = await getOrCreateUser(
          normalizedSourceModBreakUserId,
          userMap,
          req.projectId,
          req.createdUserIds
        );
      }

      const newResource = await db.Resource.create({
        ...updatedResource,
        projectId: req.projectId,
      });
      resourceMap[resource.originalId] = newResource.id;

      if (resource.tags) {
        const validTagIds = await getValidTags(
          req.projectId,
          resource.tags.map((tag) => tagMap[tag.id])
        );
        await newResource.setTags(validTagIds);
      }
      if (resource.statuses) {
        const validStatusIds = await getValidStatuses(
          req.projectId,
          resource.statuses.map((status) => statusMap[status.id])
        );
        await newResource.setStatuses(validStatusIds);
      }
    } catch (error) {
      errors.push({ step: 'Create resources', error: error.message });
    }
  }
}

// Function to update widget IDs in an object
function updateWidgetIds(
  obj,
  widgetMap,
  resourceMap,
  tagMap,
  statusMap,
  projectId
) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      updateWidgetIds(
        obj[key],
        widgetMap,
        resourceMap,
        tagMap,
        statusMap,
        projectId
      );
    } else {
      if (key === 'projectId') {
        obj[key] = projectId;
      }
      if (key === 'resourceId') {
        obj[key] = resourceMap[obj[key]];
      }
      if (key.includes('tag') || key.includes('Tag')) {
        if (obj[key]) {
          let tagValue =
            typeof obj[key] === 'number' ? obj[key].toString() : obj[key];
          if (typeof tagValue === 'string' && tagValue !== '') {
            tagValue = tagValue
              .split(',')
              .map((id) => tagMap[id] || id)
              .join(',');
            obj[key] = tagValue;
          }
        }
      }
      if (key.includes('status') || key.includes('Status')) {
        if (obj[key]) {
          let statusValue =
            typeof obj[key] === 'number' ? obj[key].toString() : obj[key];
          if (typeof statusValue === 'string' && statusValue !== '') {
            statusValue = statusValue
              .split(',')
              .map((id) => statusMap[id] || id)
              .join(',');
            obj[key] = statusValue;
          }
        }
      }
      if (key === 'choiceguideWidgetId') {
        obj[key] = widgetMap[obj[key]];
      }
    }
  }
}

// Function to update widget
async function updateWidget(widgetId, updatedData, errors) {
  try {
    await db.Widget.update(updatedData, {
      where: { id: widgetId },
    });
  } catch (error) {
    errors.push({ step: 'Update widget', error: error.message });
  }
}

// Function to update widget IDs in new widgets
async function updateWidgetIdsInNewWidgets(
  newWidgets,
  widgetMap,
  resourceMap,
  tagMap,
  statusMap,
  projectId,
  errors
) {
  for (const widget of newWidgets) {
    try {
      const updatedData = { config: widget.config };
      updateWidgetIds(
        updatedData,
        widgetMap,
        resourceMap,
        tagMap,
        statusMap,
        projectId
      );
      await updateWidget(widget.id, updatedData, errors);
    } catch (error) {
      errors.push({
        step: 'Update widget IDs in new widgets',
        error: error.message,
      });
    }
  }
}

// Function to revert the config resource settings
async function revertConfigResourceSettings(req, errors) {
  try {
    const project = await db.Project.findOne({ where: { id: req.projectId } });
    const newConfig = project?.config || {};
    newConfig.resources = req.resourceSettings || {};

    await project.update({ config: newConfig });
  } catch (error) {
    errors.push({
      step: 'Revert config resource settings',
      error: error.message,
    });
  }
}

function sanitizeAuthConfigForDuplication(config = {}) {
  const sanitizedConfig = merge.recursive({}, config || {});
  const auth =
    sanitizedConfig && sanitizedConfig.auth ? sanitizedConfig.auth : {};
  const providers = auth && auth.provider ? auth.provider : {};

  Object.keys(providers).forEach((providerKey) => {
    const providerConfig = providers[providerKey];
    if (!providerConfig || typeof providerConfig !== 'object') return;

    // Project-specific credentials and provider IDs must be regenerated.
    delete providerConfig.clientId;
    delete providerConfig.clientSecret;
    delete providerConfig.client;
    delete providerConfig.authProviderId;

    if (providerConfig.config && typeof providerConfig.config === 'object') {
      delete providerConfig.config.clientId;
      delete providerConfig.config.clientSecret;
      delete providerConfig.config.authProviderId;
    }
  });

  return sanitizedConfig;
}

function stripAuthClientManagedFieldsFromProjectConfig(config = {}) {
  if (!config || !config.auth || !config.auth.provider) return config;

  const providersForConfigStrip = config._providersForConfigStrip || {};

  Object.keys(config.auth.provider).forEach((providerKey) => {
    const providerConfig = config.auth.provider[providerKey];
    if (!providerConfig || typeof providerConfig !== 'object') return;

    // These fields are managed by auth clients and should not be persisted
    // in project config; includeAuthConfig can fetch them from auth server.
    delete providerConfig.client;
    delete providerConfig.name;
    delete providerConfig.description;
    delete providerConfig.siteUrl;
    delete providerConfig.allowedDomains;
    // Strip provider config only for providers that support client sync.
    // For providers without fetch/update client support (e.g. some OIDC setups),
    // provider.config remains source of truth and must be preserved.
    if (providersForConfigStrip[providerKey]) {
      delete providerConfig.config;
    }
  });

  delete config._providersForConfigStrip;

  return config;
}

// Endpoint to delete duplicated project and its associated data
router
  .route('/delete-duplicated-data')
  .post(auth.can('Project', 'delete'))
  .post(rateLimiter(), async function (req, res, next) {
    const { rollbackSessionId } = req.body || {};
    const parsedProjectId = parseInt(req.body?.projectId, 10);
    const projectId = Number.isNaN(parsedProjectId) ? null : parsedProjectId;
    if (!rollbackSessionId) {
      return next(new Error('Rollback session id is required'));
    }
    if (!projectId) {
      return next(new Error('Project id is required'));
    }

    const rollbackSession = await duplicateRollbackSessionStore.getSession({
      rollbackSessionId,
      projectId,
    });
    if (!rollbackSession) {
      return next(new Error('Rollback session not found or expired'));
    }
    if (String(rollbackSession.userId) !== String(req.user.id)) {
      return next(new Error('You cannot use this rollback session'));
    }

    const {
      projectId: sessionProjectId,
      tagMap = {},
      statusMap = {},
      widgetMap = {},
      resourceMap = {},
      createdUserIds = [],
    } = rollbackSession.data || {};

    if (parseInt(sessionProjectId, 10) !== projectId) {
      return next(new Error('Rollback session does not match this project'));
    }

    try {
      // Delete duplicated tags
      if (Object.keys(tagMap).length > 0) {
        for (const tagId of Object.values(tagMap)) {
          if (tagId) {
            await db.Tag.destroy({
              where: { id: tagId, projectId: sessionProjectId },
            });
          }
        }
      }

      // Delete duplicated statuses
      if (Object.keys(statusMap).length > 0) {
        for (const statusId of Object.values(statusMap)) {
          if (statusId) {
            await db.Status.destroy({
              where: { id: statusId, projectId: sessionProjectId },
            });
          }
        }
      }

      // Delete duplicated widgets
      if (Object.keys(widgetMap).length > 0) {
        for (const widgetId of Object.values(widgetMap)) {
          if (widgetId) {
            await db.Widget.destroy({
              where: { id: widgetId, projectId: sessionProjectId },
            });
          }
        }
      }

      // Delete duplicated resources
      if (Object.keys(resourceMap).length > 0) {
        for (const resourceId of Object.values(resourceMap)) {
          if (resourceId) {
            await db.Resource.destroy({
              where: { id: resourceId, projectId: sessionProjectId },
            });
          }
        }
      }

      // Delete duplicated users that were newly created in this rollback session.
      if (Array.isArray(createdUserIds) && createdUserIds.length > 0) {
        for (const userId of createdUserIds) {
          if (userId) {
            await db.User.destroy({
              where: { id: userId, projectId: sessionProjectId },
            });
          }
        }
      }

      // Delete the duplicated project
      const project = await db.Project.findOne({
        where: { id: sessionProjectId },
      });
      if (!project) return next(new Error('Project not found'));
      if (!project?.config?.project?.projectHasEnded) {
        const updatedConfig = {
          ...project.config,
          project: {
            ...project.config.project,
            projectHasEnded: true,
          },
        };

        await project.update({ config: updatedConfig });
      }

      await project.destroy();
      await duplicateRollbackSessionStore.removeSession({
        rollbackSessionId,
        projectId: sessionProjectId,
      });

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

// scopes
// ------
router.all('*', function (req, res, next) {
  req.scope = ['excludeEmailConfig'];

  if (!req.query.includeConfig && !req.query.includeAuthConfig) {
    req.scope.push('excludeConfig');
  }

  if (req.query.includeEmailConfig) {
    req.scope.push('includeEmailConfig');
  }

  if (req.query.getBasicInformation) {
    req.scope.push('getBasicInformation');
  }

  if (req.query.includeAreas) {
    req.scope.push('includeAreas');
  }

  if (req.query.includeInstallationUrls) {
    req.scope.push('includeInstallationUrls');
  }

  return next();
});

router
  .route('/')

  // list projects
  // ----------
  .get(function (req, res, next) {
    if (req.scope.includes('getBasicInformation')) {
      return next();
    }

    return auth.can('Project', 'list')(req, res, next);
  })
  .get(pagination.init)
  .get(function (req, res, next) {
    if (req.query.includeAuthConfig)
      return next('includeAuthConfig is not implemented for projects list');
    return next();
  })
  .get(async function (req, res, next) {
    try {
      let where = {};
      if (
        !hasRole(req.user, 'superuser') &&
        !req.scope.includes('getBasicInformation')
      ) {
        // first find all corresponding users for the current user, only where she is admin
        let users = await db.User.findAll({
          where: {
            idpUser: {
              identifier:
                req.user?.idpUser?.identifier || 'no identifier found',
              provider: req.user?.idpUser?.provider || 'no provider found',
            },
            [Op.or]: [{ role: 'admin' }, { role: 'editor' }],
          },
        });
        let projectIds = users.map((u) => u.projectId);
        where = { id: projectIds };
      }

      // now find the corresponding projects
      let result = await db.Project.scope(req.scope).findAndCountAll({
        offset: req.dbQuery.offset,
        limit: req.dbQuery.limit,
        where,
      });
      if (req.user?.role === 'editor') {
        result.rows = result.rows.filter((project) => project.id !== 1);
      }

      if (req.scope.includes('getBasicInformation')) {
        result.rows = result.rows.map((project) => {
          const p = project.toJSON();
          return {
            id: p.id,
            createdAt: p.createdAt,
            tags: p?.config?.project?.tags || '',
          };
        });
      }

      req.results = result.rows;
      req.dbQuery.count = result.count;
      return next();
    } catch (err) {
      next(err);
    }
  })
  .get(searchInResults({ searchfields: ['name', 'title'] }))
  .get(auth.useReqUser)
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    let records = req.results.records || req.results;
    records.forEach((record, i) => {
      // todo: waarom is dit? dat zou door het auth systeem moeten worden afgevangen
      let project =
        typeof record.toJSON === 'function' ? record.toJSON() : record;
      if (!(req.user && hasRole(req.user, 'admin'))) {
        project.config = undefined;
        project.safeConfig = undefined;
      }
      records[i] = project;
    });
    res.json(req.results);
  })

  // create project
  // -----------
  .post(auth.can('Project', 'create'))
  .post(removeProtocolFromUrl)
  .post(rateLimiter(), async function (req, res, next) {
    const isDuplicationPayload = req.body.isDuplicateRequest === true;
    req.isDuplicationPayload = isDuplicationPayload;
    delete req.body.isDuplicateRequest;
    const parsedSourceProjectId = parseInt(req.body.sourceProjectId, 10);
    req.sourceProjectId = Number.isNaN(parsedSourceProjectId)
      ? null
      : parsedSourceProjectId;
    delete req.body.sourceProjectId;
    req.widgets = req.body.widgets || [];
    req.tags = req.body.tags || [];
    req.statuses = req.body.statuses || [];
    req.resources = req.body.resources || [];
    req.resourceSettings = req.body.resourceSettings || {};
    req.skipDefaultStatuses = req.body.skipDefaultStatuses || false;
    req.notificationTemplates = req.body.notificationTemplates || [];

    delete req.body.widgets;
    delete req.body.tags;
    delete req.body.statuses;
    delete req.body.resources;
    delete req.body.resourceSettings;
    delete req.body.notificationTemplates;
    req.authProviderConfigForSync = {};
    if (isDuplicationPayload) {
      req.body.config = sanitizeAuthConfigForDuplication(req.body.config || {});
      const fallbackProviderConfig = merge.recursive(
        {},
        req.body?.config?.auth?.provider || {}
      );
      let sourceProjectForAuthSync = null;
      if (req.sourceProjectId) {
        const canUseSourceProject = await canUserUseSourceProjectForDuplication(
          {
            req,
            sourceProjectId: req.sourceProjectId,
          }
        );
        if (!canUseSourceProject) {
          return next(
            new Error('Not allowed to duplicate from this source project')
          );
        }
        sourceProjectForAuthSync = await db.Project.findByPk(
          req.sourceProjectId
        );
        if (!sourceProjectForAuthSync) {
          return next(new Error('Source project not found'));
        }
      }
      req.authProviderConfigForSync = await buildAuthProviderSyncConfig({
        sourceProject: sourceProjectForAuthSync,
        fallbackProviderConfig,
      });
    }

    // create an oauth client if nessecary
    let project = {
      config: req.body.config || {},
    };
    try {
      project.name = project?.name || req.body?.name || '';
      let providers = await authSettings.providers({
        project,
        useOnlyDefinedOnProject: true,
      });
      let providersDone = [];
      for (let provider of providers) {
        let authConfig = await authSettings.config({
          project,
          useAuth: provider,
        });

        // Prevent prototype pollution
        if (
          authConfig?.provider === '__proto__' ||
          authConfig?.provider === 'constructor' ||
          authConfig?.provider === 'prototype'
        )
          continue;

        if (!providersDone[authConfig.provider]) {
          // filter for duplicates like 'default'
          let adapter = await authSettings.adapter({ authConfig });
          req.providersForConfigStrip = req.providersForConfigStrip || {};
          req.providersForConfigStrip[authConfig.provider] =
            !!adapter.service.updateClient;
          if (adapter.service.createClient) {
            let client = await adapter.service.createClient({
              authConfig,
              project,
            });
            project.config.auth.provider[authConfig.provider] =
              project.config.auth.provider[authConfig.provider] || {};
            project.config.auth.provider[authConfig.provider].clientId =
              client.clientId;
            project.config.auth.provider[authConfig.provider].clientSecret =
              client.clientSecret;
            delete project.config.auth.provider[authConfig.provider].authTypes;
            delete project.config.auth.provider[authConfig.provider]
              .twoFactorRoles;
            delete project.config.auth.provider[authConfig.provider]
              .requiredUserFields;
            providersDone[authConfig.provider] = true;
          }
        }
      }
      if (req.body.config && req.body.config.auth) {
        if (req.isDuplicationPayload) {
          req.body.config._providersForConfigStrip =
            req.providersForConfigStrip;
          req.body.config = stripAuthClientManagedFieldsFromProjectConfig(
            req.body.config || {}
          );
        }
        req.body.config.auth = project.config.auth;
      }
      return next();
    } catch (err) {
      return next(err);
    }
  })
  .post(function (req, res, next) {
    db.Project.create(
      { emailConfig: {}, ...req.body },
      { skipDefaultStatuses: req.skipDefaultStatuses }
    )
      .then((result) => {
        req.results = result;
        req.projectId = result.id;

        return checkHostStatus({ id: result.id });
      })
      .then(() => {
        next();
        return null;
      })
      .catch(next);
  })
  .post(async function (req, res, next) {
    // Sync full auth provider settings to auth clients after project is created.
    // During creation we store a reduced auth config in project.config, so use the
    // original incoming provider settings captured before normalization.
    if (!req.isDuplicationPayload) return next();
    const project = await db.Project.findOne({ where: { id: req.results.id } });
    if (!project || !hasRole(req.user, 'admin')) return next();

    try {
      let providers = await authSettings.providers({ project });

      for (let provider of providers) {
        const providerConfig = req.authProviderConfigForSync?.[provider] || {};
        const configData = providerConfig.config || {};
        const normalizedConfigData =
          normalizeConfigForOpenstadClientSync(configData);
        const requiredUserFields = providerConfig.requiredUserFields;
        const twoFactorRoles = providerConfig.twoFactorRoles;
        const authTypes = providerConfig.authTypes;
        let allowedDomains =
          providerConfig.allowedDomains ?? req.body?.config?.allowedDomains;

        if (Array.isArray(allowedDomains)) {
          allowedDomains = allowedDomains.map((d) =>
            typeof d === 'string' ? d.trim() : d
          );
        }

        if (
          Object.keys(normalizedConfigData).length === 0 &&
          !requiredUserFields &&
          !twoFactorRoles &&
          !authTypes &&
          !!!allowedDomains
        ) {
          continue;
        }

        let authConfig = await authSettings.config({
          project,
          useAuth: provider,
        });
        let adapter = await authSettings.adapter({ authConfig });

        if (!!allowedDomains) {
          authConfig.allowedDomains = allowedDomains;
        }

        if (adapter.service.updateClient) {
          let merged = merge.recursive({}, authConfig, {
            config: normalizedConfigData,
            authTypes: authTypes || authConfig.authTypes,
            requiredUserFields:
              requiredUserFields || authConfig.requiredUserFields,
            twoFactorRoles: twoFactorRoles || authConfig.twoFactorRoles,
          });
          await adapter.service.updateClient({ authConfig: merged, project });
        }
      }

      return next();
    } catch (err) {
      const rollbackData = {
        projectId: req.results.id,
        tagMap: {},
        statusMap: {},
        widgetMap: {},
        resourceMap: {},
        createdUserIds: [],
      };
      const rollbackSessionId = duplicateRollbackSessionStore.createSession({
        userId: req.user.id,
        data: rollbackData,
      });
      await duplicateRollbackSessionStore.saveSessionOnProject({
        projectId: req.results.id,
        sessionId: rollbackSessionId,
        userId: req.user.id,
        data: rollbackData,
      });
      return res.status(500).json({
        errors: [{ step: 'Sync auth provider settings', error: err.message }],
        duplicatedData: {
          rollbackSessionId,
          projectId: req.results.id,
        },
      });
    }
  })
  .post(async function (req, res, next) {
    const errors = [];

    try {
      req.query.nomail = true;

      const tagMap = {};
      const statusMap = {};
      const widgetMap = {};
      const userMap = {};
      req.createdUserIds = new Set();
      const newWidgets = [];
      const resourceMap = {};

      await createTags(req, tagMap, errors);
      await createStatuses(req, statusMap, errors);
      await createWidgets(req, widgetMap, newWidgets, errors);
      await createNotificationTemplates(req, errors);
      await createResources(
        req,
        resourceMap,
        widgetMap,
        tagMap,
        statusMap,
        userMap,
        errors
      );
      await updateWidgetIdsInNewWidgets(
        newWidgets,
        widgetMap,
        resourceMap,
        tagMap,
        statusMap,
        req.projectId,
        errors
      );
      await revertConfigResourceSettings(req, errors);

      if (errors.length > 0) {
        const rollbackData = {
          projectId: req.projectId,
          tagMap,
          statusMap,
          widgetMap,
          resourceMap,
          createdUserIds: Array.from(req.createdUserIds || []),
          newWidgets,
        };
        const rollbackSessionId = duplicateRollbackSessionStore.createSession({
          userId: req.user.id,
          data: rollbackData,
        });
        await duplicateRollbackSessionStore.saveSessionOnProject({
          projectId: req.projectId,
          sessionId: rollbackSessionId,
          userId: req.user.id,
          data: rollbackData,
        });
        return res.status(500).json({
          errors: errors,
          duplicatedData: {
            rollbackSessionId,
            projectId: req.projectId,
          },
        });
      }

      return next();
    } catch (error) {
      errors.push({ step: 'Overall', error: error.message });
      res.status(500).json({ errors });
    }
  })
  .post(async function (req, res, next) {
    // Add current user as admin to the newly made project
    const project = await db.Project.findOne({ where: { id: req.results.id } });
    if (!project) return next(new Error('Project not found'));
    const sourceUser = await db.User.findOne({
      where: { id: req.user.id },
      raw: true,
    });

    if (sourceUser && req.user) {
      const userData = { ...sourceUser };
      delete userData.id;
      userData.projectId = project.id;

      const existingProjectUser = await db.User.findOne({
        where: Sequelize.and(
          {
            idpUser: {
              identifier:
                sourceUser &&
                sourceUser.idpUser &&
                sourceUser.idpUser.identifier,
              provider:
                sourceUser && sourceUser.idpUser && sourceUser.idpUser.provider,
            },
          },
          { projectId: project.id }
        ),
      });

      if (existingProjectUser) {
        await existingProjectUser.update(userData);
      } else {
        await db.User.create(userData);
      }

      // Sync user role to auth server so user_roles entry is created
      try {
        const authConfig = await authSettings.config({
          project,
          useAuth: 'default',
        });
        const adapter = await authSettings.adapter({ authConfig });
        if (
          userData.idpUser &&
          userData.idpUser.identifier &&
          adapter.service.updateUser
        ) {
          await adapter.service.updateUser({
            authConfig,
            userData: {
              id: userData.idpUser.identifier,
              role: userData.role,
            },
          });
        }
      } catch (err) {
        console.error(
          'Failed to sync user role to auth server for new project:',
          err
        );
      }
    }

    return next();
  })
  .post(async function (req, res, next) {
    let publisher = await messageStreaming.getPublisher();
    if (publisher) {
      publisher.publish('new-project', 'event');
    } else {
      console.log('No publisher found');
    }
    return next();
  })
  .post(auth.useReqUser)
  .post(function (req, res, next) {
    return res.json(req.isDuplicationPayload ? req.projectId : req.results);
  });

// list projects with issues
router
  .route('/issues')
  // -------------------------------
  .get(auth.can('Project', 'list'))
  .get(pagination.init)
  .get(function (req, res, next) {
    req.results = [];
    req.dbQuery.count = 0;
    return next();
  })
  .get(function (req, res, next) {
    // projects that should be ended but are not
    projectsWithIssues
      .shouldHaveEndedButAreNot({
        offset: req.dbQuery.offset,
        limit: req.dbQuery.limit,
      })
      .then((result) => {
        req.results = req.results.concat(result.rows);
        req.dbQuery.count += result.count;
        return next();
      })
      .catch(next);
  })
  .get(function (req, res, next) {
    // projects that have ended but are not anonymized
    projectsWithIssues
      .endedButNotAnonymized({
        offset: req.dbQuery.offset,
        limit: req.dbQuery.limit,
      })
      .then((result) => {
        // zie module: deze query is een findAll ipv findAndCountAll
        // req.results = req.results.concat( result.rows );
        // req.dbQuery.count += result.count;
        req.results = req.results.concat(result);
        req.dbQuery.count += result.length;
        return next();
      })
      .catch(next);
  })
  .get(searchInResults({ searchfields: ['name', 'title'] }))
  .get(auth.useReqUser)
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    let records = req.results.records || req.results;
    records.forEach((record, i) => {
      let project = record.toJSON();
      if (!(req.user && hasRole(req.user, 'admin'))) {
        project.config = undefined;
      }
      records[i] = project;
    });
    res.json(req.results);
  });

// one project routes: get project
// -------------------------
router
  .route('/:projectId') //(\\d+)
  .all(auth.can('Project', 'view'))
  .all(async function (req, res, next) {
    await getProject(req, res, next);
  })

  // view project
  // ---------
  .get(auth.can('Project', 'view'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // update project
  // -----------
  .put(auth.useReqUser)
  .put(removeProtocolFromUrl)
  .put(rateLimiter(), async function (req, res, next) {
    // update certain parts of config to the oauth client
    const project = await db.Project.findOne({ where: { id: req.results.id } });
    if (!hasRole(req.user, 'admin')) return next();
    try {
      let providers = await authSettings.providers({ project });
      const configData =
        req.body.config?.auth?.provider?.openstad?.config || {};
      let allowedDomains = req.body.config?.allowedDomains || false;
      if (Array.isArray(allowedDomains)) {
        allowedDomains = allowedDomains.map((d) =>
          typeof d === 'string' ? d.trim() : d
        );
        req.body.config.allowedDomains = allowedDomains;
      }
      const twoFactorRoles =
        req.body.config?.auth?.provider?.openstad?.twoFactorRoles;

      for (let provider of providers) {
        // Get provider-specific config data
        const providerConfig =
          req.body.config?.auth?.provider?.[provider] || {};
        const configData = providerConfig.config || {};
        const requiredUserFields = providerConfig.requiredUserFields;
        const twoFactorRoles = providerConfig.twoFactorRoles;

        // Skip if no config data and no allowedDomains update
        if (
          Object.keys(configData).length === 0 &&
          !requiredUserFields &&
          !!!allowedDomains
        ) {
          continue;
        }

        let authConfig = await authSettings.config({
          project,
          useAuth: provider,
        });
        let adapter = await authSettings.adapter({ authConfig });

        if (!!allowedDomains) {
          authConfig.allowedDomains = allowedDomains;
        }

        if (adapter.service.updateClient) {
          let merged = merge.recursive({}, authConfig, {
            config: configData,
            requiredUserFields:
              requiredUserFields || authConfig.requiredUserFields,
            twoFactorRoles: twoFactorRoles || authConfig.twoFactorRoles,
          });
          await adapter.service.updateClient({ authConfig: merged, project });
          // delete req.body.config?.auth?.provider?.[authConfig.provider]?.authTypes;
          // delete req.body.config?.auth?.provider?.[authConfig.provider]?.twoFactorRoles;
          // delete req.body.config?.auth?.provider?.[authConfig.provider]?.requiredUserFields;
          delete req.body.config?.auth?.provider?.[authConfig.provider]?.config;
        }
      }
      return next();
    } catch (err) {
      return next(err);
    }
  })
  .put(async function (req, res, next) {
    const project = await db.Project.findOne({ where: { id: req.results.id } });
    if (!(project && project.can && project.can('update')))
      return next(new Error('You cannot update this project'));

    req.pendingMessages = [
      { key: `project-${project.id}-update`, value: 'event' },
    ];
    if (req.body.url && req.body.url != project.url)
      req.pendingMessages.push({ key: `project-urls-update`, value: 'event' });

    // Update allowedDomains if creating a new site
    let updateBody = req.body;
    const hasInitDomain =
      project?.config?.allowedDomains !== undefined &&
      project.config.allowedDomains.length === 1 &&
      project.config.allowedDomains[0] == 'api.openstad.org';
    if (
      ((project?.config?.allowedDomains || []).length === 0 || hasInitDomain) &&
      req?.body?.url
    ) {
      // Check if url has protocol
      let reqUrl = req.body.url;
      if (!reqUrl.includes('http://') && !reqUrl.includes('https://')) {
        reqUrl = 'http://' + reqUrl;
      }
      let url = new URL(reqUrl);
      let host = url.host;

      updateBody.config = updateBody.config || {};
      updateBody.config.allowedDomains = [host];

      // Update client (auth-db)
      let adminAuthConfig = await authSettings.config({ project: project });
      service.updateClient({
        authConfig: adminAuthConfig,
        project: updateBody,
      });
    }

    project
      .authorizeData(req.body, 'update')
      .update(updateBody)
      .then((result) => {
        req.results = result;
        return checkHostStatus({ id: result.id });
      })
      .then(async () => {
        // Re-read so response includes hostStatus written by checkHostStatus
        const fresh = await db.Project.scope('includeConfig').findByPk(
          req.results.id
        );
        if (fresh) {
          fresh.auth = req.results.auth;
          req.results = fresh;
        }
        next();
        return null;
      })
      .catch((err) => {
        console.log('Ignore checkHostStatus error', err);
        next();
        return null;
      });
  })
  .put(async function (req, res, next) {
    if (!req.pendingMessages) return next();
    let publisher = await messageStreaming.getPublisher();
    if (publisher) {
      req.pendingMessages.map((message) => {
        console.log('Message:', message.key, message.value);
        publisher.publish(message.key, message.value);
      });
    } else {
      console.log('No publisher found');
    }
    return next();
  })
  .put(async function (req, res, next) {
    // Check if updating allowedDomains
    if (typeof req?.results?.config?.allowedDomains !== 'undefined') {
      let proj = req.results.dataValues;

      // Check if allowedDomains exists
      if (
        typeof req?.results?.config?.allowedDomains !== 'undefined' &&
        req.results.config.allowedDomains.length > 0
      ) {
        proj.config.allowedDomains = req.results.config.allowedDomains;
      }
    }

    // when succesfull return project JSON
    res.json(req.results);
  })

  // delete project
  // ---------
  .delete(auth.can('Project', 'delete'))
  .delete(async function (req, res, next) {
    const project = await db.Project.findOne({
      where: { id: req.params.projectId },
    });
    if (!project) return next(new Error('Project not found'));
    if (!project?.config?.project?.projectHasEnded) {
      return next(new Error('Project has not ended yet'));
    }

    try {
      // Clean up K8s ExternalSecret if project used external certificates
      if (externalCertificates.isEnabled()) {
        const certConfig = getCertificateConfig(project.config);
        if (certConfig.certificateMethod === 'external') {
          const namespace = process.env.KUBERNETES_NAMESPACE;
          if (namespace) {
            try {
              const slugOverride = certConfig.externalCertSlug || null;
              const secretName = externalCertificatesManager.generateSecretName(
                project.url,
                namespace,
                slugOverride
              );
              await externalCertificatesManager.deleteExternalSecret(
                secretName,
                namespace
              );
            } catch (cleanupErr) {
              console.error(
                '[external-certificates] Failed to clean up ExternalSecret for project %s',
                project.id
              );
              // Non-blocking: proceed with deletion even if K8s cleanup fails
            }
          }
        }
      }

      await project.destroy();
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

// export a project
// -------------------
router
  .route('/:projectId(\\d+)/export')
  .all(auth.can('Project', 'view'))
  .all(async function (req, res, next) {
    await getProject(req, res, next, [
      {
        model: db.Resource,
        include: [
          { model: db.Tag },
          { model: db.Vote },
          { model: db.Comment, as: 'commentsFor' },
          { model: db.Comment, as: 'commentsAgainst' },
          { model: db.Comment, as: 'commentsNoSentiment' },
          { model: db.Poll, as: 'poll' },
        ],
      },
      { model: db.Tag },
      { model: db.Status },
      { model: db.Widget },
    ]);
  })

  .get(auth.can('Project', 'view'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  });

// anonymize all users
// -------------------
router
  .route('/:projectId(\\d+)/:willOrDo(will|do)-anonymize-all-users')
  .put(auth.can('Project', 'anonymizeAllUsers'))
  .put(rateLimiter(), function (req, res, next) {
    // the project
    let where = { id: parseInt(req.params.projectId) };
    db.Project.findOne({ where })
      .then((found) => {
        if (!found) {
          return next(createError(404, 'Project not found'));
        }
        req.results = found;
        req.project = req.results; // middleware expects this to exist
        next();
      })
      .catch(next);
  })
  .put(async function (req, res, next) {
    try {
      const result = await req.project.willAnonymizeAllUsers();
      req.results = result;
      if (req.params.willOrDo == 'do') {
        result.message = 'Ok';

        req.project.doAnonymizeAllUsers([...result.users], req.query.useAuth);
      }
      next();
    } catch (err) {
      return next(err);
    }
  })
  .put(function (req, res, next) {
    // customized version of auth.useReqUser
    delete req.results.externalUserIds;
    Object.keys(req.results).forEach((which) => {
      req.results[which] &&
        req.results[which].forEach &&
        req.results[which].forEach((result) => {
          if (typeof result == 'object') {
            result.auth = result.auth || {};
            result.auth.user = req.user;
          }
        });
    });
    return next();
  })
  .put(function (req, res, next) {
    res.json(req.results);
  });

router
  .route('/:projectId(\\d+)/css/:componentId?')
  .get(function (req, res, next) {
    let css = req.project?.config?.project?.cssCustom || '';

    if (req.params.componentId) {
      css += `\n\n#${req.params.componentId} { width: 100%; height: 100%; }`;
    }

    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  });

router
  .route('/:projectId(\\d+)/widget-css/:widgetType')
  .get(function (req, res, next) {
    if (!req.params.widgetType)
      return next(
        createError(400, 'Invalid widget type given for fetching settings')
      );

    let widgetSettings = widgetDefinitions[req.params.widgetType];

    if (!widgetSettings) {
      return next(
        createError(400, 'Invalid widget type given for fetching settings')
      );
    }

    let css = '';

    widgetSettings.css.forEach((file) => {
      try {
        css += fs.readFileSync(
          require.resolve(`${widgetSettings.packageName}/${file}`),
          'utf8'
        );
      } catch (e) {}
    });

    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  });

async function getValidStatuses(projectId, statuses) {
  const uniqueIds = Array.from(new Set(statuses));

  const statusesOfProject = await db.Status.findAll({
    where: { projectId, id: { [Op.in]: uniqueIds } },
  });

  return statusesOfProject;
}

async function getValidTags(projectId, tags) {
  const uniqueIds = Array.from(new Set(tags));
  const validTags = await db.Tag.findAll({
    where: {
      id: uniqueIds,
      projectId: projectId,
    },
  });
  return validTags.map((tag) => tag.id);
}

// Certificate retry endpoint
// -------------------------
router
  .route('/:projectId(\\d+)/certificate-retry')
  .post(auth.can('Project', 'update'))
  .post(async function (req, res, next) {
    try {
      // Feature gate
      if (!externalCertificates.isEnabled()) {
        return res
          .status(400)
          .json({ error: 'External certificates feature is not enabled' });
      }

      const project = await db.Project.findByPk(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check project is configured for external certs (new path with fallback)
      const certMethod =
        project.config?.certificates?.certificateMethod ||
        project.config?.certificateMethod;
      if (certMethod !== 'external') {
        return res.status(400).json({
          error: 'Project is not configured for external certificates',
        });
      }

      // Cooldown check
      const projectId = parseInt(req.params.projectId);
      const lastTrigger = certRetryCooldowns.get(projectId);
      if (lastTrigger && Date.now() - lastTrigger < CERT_RETRY_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil(
          (CERT_RETRY_COOLDOWN_MS - (Date.now() - lastTrigger)) / 1000
        );
        return res.status(429).json({
          error: `Retry cooldown active. Try again in ${remainingSeconds} seconds.`,
          retryAfter: remainingSeconds,
        });
      }

      // Set cooldown with auto-cleanup to prevent memory leak
      certRetryCooldowns.set(projectId, Date.now());
      setTimeout(
        () => certRetryCooldowns.delete(projectId),
        CERT_RETRY_COOLDOWN_MS
      );

      const namespace = process.env.KUBERNETES_NAMESPACE;
      const slugOverride =
        project.config?.certificates?.externalCertSlug ||
        project.config?.externalCertSlug ||
        null;
      const secretName = externalCertificatesManager.generateSecretName(
        project.url,
        namespace,
        slugOverride
      );

      // Full retry: ensure ExternalSecret exists, wait for readiness, update Ingress
      await externalCertificatesManager.ensureExternalSecret(
        secretName,
        namespace
      );
      const certStatus = await externalCertificatesManager.waitForSecretReady(
        secretName,
        namespace
      );

      // Clone to avoid Sequelize JSON mutation trap (same pattern as checkHostStatus.js)
      let hostStatus = project.hostStatus ? { ...project.hostStatus } : {};
      hostStatus.certificate = {
        method: 'external',
        state: certStatus.state,
        secretName,
        lastChecked: new Date().toISOString(),
      };
      await project.update({ hostStatus });

      // If ready, trigger full checkHostStatus to attach TLS to Ingress
      if (certStatus.ready) {
        await checkHostStatus({ id: projectId });
      }

      return res.json({
        state: certStatus.state,
        secretName,
        ready: certStatus.ready,
      });
    } catch (error) {
      console.error(
        '[external-certificates] Retry failed for project %s',
        String(req.params.projectId)
      );
      return res.status(500).json({ error: 'Certificate retry failed' });
    }
  });

module.exports = router;
