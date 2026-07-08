/**
 * Project controller.
 *
 * Request/response orchestration for the project routes. Reads input off the
 * Express request, delegates business logic to services, and shapes responses.
 * Extracted from routes/api/project.js (#1640); see doc/adr-0001-api-server-layering.md.
 *
 * Handlers are exported individually so routes/api/project.js can wire them
 * into the middleware chains in the exact same order as before.
 */
const merge = require('merge');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const fs = require('fs');
const createError = require('http-errors');

const db = require('../db');
const auth = require('../middleware/sequelize-authorization-middleware');
const checkHostStatus = require('../services/checkHostStatus');
const projectsWithIssues = require('../services/projects-with-issues');
const authSettings = require('../util/auth-settings');
const hasRole = require('../lib/sequelize-authorization/lib/hasRole');
const messageStreaming = require('../services/message-streaming');
const {
  normalizeConfigForOpenstadClientSync,
} = require('../util/project-duplication-auth');
const {
  createDuplicateRollbackSessionStore,
} = require('../util/duplicate-rollback-session');
const getWidgetSettings = require('../routes/widget/widget-settings');

const dup = require('../services/projectDuplication');
const authClientSync = require('../services/authClientSync');
const projectCertificates = require('../services/projectCertificates');

const widgetDefinitions = getWidgetSettings();

const DUPLICATE_ROLLBACK_SESSION_TTL_MS = 60 * 60 * 1000;
const duplicateRollbackSessionStore = createDuplicateRollbackSessionStore({
  projectModel: db.Project,
  ttlMs: DUPLICATE_ROLLBACK_SESSION_TTL_MS,
});

// ----------------------------------------------------------------------------
// Shared middleware / loaders
// ----------------------------------------------------------------------------

// Middleware: reject duplicate project URLs (case-insensitive, ignoring www and trailing slashes).
// `removeProtocolFromUrl` already strips the protocol from req.body.url before this runs.
// The DB index (`projects_url_unique`) enforces exact uniqueness; this middleware enforces
// normalized uniqueness (e.g. www.example.com/ == example.com).
function checkUniqueUrl(req, res, next) {
  if (!req.body.url) return next();

  let normalizedUrl = req.body.url
    .trim()
    .toLowerCase()
    .replace(/^www\./, '');
  while (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }

  if (!normalizedUrl) return next();

  const excludeId = req.params.projectId
    ? parseInt(req.params.projectId)
    : null;

  const normalizedColumn = Sequelize.literal(
    "LOWER(TRIM(TRAILING '/' FROM REPLACE(REPLACE(REPLACE(`url`, 'https://', ''), 'http://', ''), 'www.', '')))"
  );

  const whereClause = excludeId
    ? {
        [Op.and]: [
          Sequelize.where(normalizedColumn, normalizedUrl),
          { id: { [Op.ne]: excludeId } },
        ],
      }
    : Sequelize.where(normalizedColumn, normalizedUrl);

  db.Project.findOne({ where: whereClause })
    .then((existing) => {
      if (existing) {
        return next(
          createError(409, 'Deze URL is al in gebruik door een ander project.')
        );
      }
      return next();
    })
    .catch(next);
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

function loadProject(req, res, next) {
  return getProject(req, res, next);
}

function loadProjectForExport(req, res, next) {
  return getProject(req, res, next, [
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
  ]);
}

// ----------------------------------------------------------------------------
// Delete duplicated project data (rollback)  (POST /delete-duplicated-data)
// ----------------------------------------------------------------------------

async function deleteDuplicatedData(req, res, next) {
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
    // Bulk delete duplicated data; individualHooks on these models still run
    // the per-row destroy hooks.
    const tagIds = Object.values(tagMap).filter(Boolean);
    if (tagIds.length > 0) {
      await db.Tag.destroy({
        where: { id: tagIds, projectId: sessionProjectId },
      });
    }

    const statusIds = Object.values(statusMap).filter(Boolean);
    if (statusIds.length > 0) {
      await db.Status.destroy({
        where: { id: statusIds, projectId: sessionProjectId },
      });
    }

    const widgetIds = Object.values(widgetMap).filter(Boolean);
    if (widgetIds.length > 0) {
      await db.Widget.destroy({
        where: { id: widgetIds, projectId: sessionProjectId },
      });
    }

    const resourceIds = Object.values(resourceMap).filter(Boolean);
    if (resourceIds.length > 0) {
      await db.Resource.destroy({
        where: { id: resourceIds, projectId: sessionProjectId },
      });
    }

    // Delete duplicated users that were newly created in this rollback session.
    const userIds = (Array.isArray(createdUserIds) ? createdUserIds : []).filter(
      Boolean
    );
    if (userIds.length > 0) {
      await db.User.destroy({
        where: { id: userIds, projectId: sessionProjectId },
      });
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
}

// ----------------------------------------------------------------------------
// Scope
// ----------------------------------------------------------------------------

function setScope(req, res, next) {
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
}

// ----------------------------------------------------------------------------
// List projects  (GET /)
// ----------------------------------------------------------------------------

function listProjectsAuthGate(req, res, next) {
  if (req.scope.includes('getBasicInformation')) {
    return next();
  }

  return auth.can('Project', 'list')(req, res, next);
}

function rejectIncludeAuthConfigForList(req, res, next) {
  if (req.query.includeAuthConfig)
    return next('includeAuthConfig is not implemented for projects list');
  return next();
}

async function listProjects(req, res, next) {
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
            identifier: req.user?.idpUser?.identifier || 'no identifier found',
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
}

function serializeProjectsList(req, res, next) {
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
}

// ----------------------------------------------------------------------------
// Create project  (POST /)
// ----------------------------------------------------------------------------

async function prepareDuplicationPayload(req, res, next) {
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
    req.body.config = authClientSync.sanitizeAuthConfigForDuplication(
      req.body.config || {}
    );
    const fallbackProviderConfig = merge.recursive(
      {},
      req.body?.config?.auth?.provider || {}
    );
    let sourceProjectForAuthSync = null;
    if (req.sourceProjectId) {
      const canUseSourceProject =
        await authClientSync.canUserUseSourceProjectForDuplication({
          user: req.user,
          sourceProjectId: req.sourceProjectId,
        });
      if (!canUseSourceProject) {
        return next(
          new Error('Not allowed to duplicate from this source project')
        );
      }
      sourceProjectForAuthSync = await db.Project.findByPk(req.sourceProjectId);
      if (!sourceProjectForAuthSync) {
        return next(new Error('Source project not found'));
      }
    }
    req.authProviderConfigForSync =
      await authClientSync.buildAuthProviderSyncConfig({
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
        req.body.config._providersForConfigStrip = req.providersForConfigStrip;
        req.body.config =
          authClientSync.stripAuthClientManagedFieldsFromProjectConfig(
            req.body.config || {}
          );
      }
      req.body.config.auth = project.config.auth;
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function createProjectRecord(req, res, next) {
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
}

async function syncAuthProvidersAfterCreate(req, res, next) {
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
}

async function createDuplicatedData(req, res, next) {
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

    await dup.createTags(req.tags, req.projectId, tagMap, errors);
    await dup.createStatuses(req.statuses, req.projectId, statusMap, errors);
    await dup.createWidgets(
      req.widgets,
      req.projectId,
      widgetMap,
      newWidgets,
      errors
    );
    await dup.createNotificationTemplates(
      req.notificationTemplates,
      req.projectId,
      errors
    );
    await dup.createResources(
      req.resources,
      req.projectId,
      resourceMap,
      widgetMap,
      tagMap,
      statusMap,
      userMap,
      req.createdUserIds,
      errors
    );
    await dup.updateWidgetIdsInNewWidgets(
      newWidgets,
      widgetMap,
      resourceMap,
      tagMap,
      statusMap,
      req.projectId,
      errors
    );
    await dup.revertConfigResourceSettings(
      req.projectId,
      req.resourceSettings,
      errors
    );

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
}

async function addCurrentUserAsAdmin(req, res, next) {
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
              sourceUser && sourceUser.idpUser && sourceUser.idpUser.identifier,
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
}

async function publishNewProjectEvent(req, res, next) {
  let publisher = await messageStreaming.getPublisher();
  if (publisher) {
    publisher.publish('new-project', 'event');
  } else {
    console.log('No publisher found');
  }
  return next();
}

function respondCreatedProject(req, res, next) {
  return res.json(req.isDuplicationPayload ? req.projectId : req.results);
}

// ----------------------------------------------------------------------------
// Projects with issues  (GET /issues)
// ----------------------------------------------------------------------------

function initIssuesResults(req, res, next) {
  req.results = [];
  req.dbQuery.count = 0;
  return next();
}

function addShouldHaveEndedIssues(req, res, next) {
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
}

function addEndedNotAnonymizedIssues(req, res, next) {
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
}

async function addBlockedDomainsIssues(req, res, next) {
  // blocked domains (last 24h)
  try {
    let blockedByProject = await projectsWithIssues.blockedDomains();
    for (let projectId of Object.keys(blockedByProject)) {
      let { project, blocks } = blockedByProject[projectId];
      let entry = project.toJSON();
      entry.issue = 'blocked-domains';
      entry.domainBlocks = blocks.map((b) => ({
        widgetId: b.widgetId,
        domain: b.domain,
        referer: b.referer,
        count: b.count,
        lastSeen: b.lastSeen,
      }));
      req.results.push(entry);
      req.dbQuery.count += 1;
    }
  } catch (e) {
    console.log('[issues] Could not fetch blocked domains:', e.message);
  }
  return next();
}

function serializeIssuesList(req, res, next) {
  let records = req.results.records || req.results;
  records.forEach((record, i) => {
    let project =
      typeof record.toJSON === 'function' ? record.toJSON() : record;
    if (!(req.user && hasRole(req.user, 'admin'))) {
      project.config = undefined;
    }
    records[i] = project;
  });
  res.json(req.results);
}

// ----------------------------------------------------------------------------
// Single project: view / update / delete  (/:projectId)
// ----------------------------------------------------------------------------

function viewProject(req, res, next) {
  res.json(req.results);
}

async function updateAuthClients(req, res, next) {
  // update certain parts of config to the oauth client
  const project = await db.Project.findOne({ where: { id: req.results.id } });
  if (!hasRole(req.user, 'admin')) return next();
  try {
    let providers = await authSettings.providers({ project });
    let allowedDomains = req.body.config?.allowedDomains || false;
    if (Array.isArray(allowedDomains)) {
      allowedDomains = allowedDomains.map((d) =>
        typeof d === 'string' ? d.trim() : d
      );
      req.body.config.allowedDomains = allowedDomains;
    }

    for (let provider of providers) {
      // Get provider-specific config data
      const providerConfig = req.body.config?.auth?.provider?.[provider] || {};
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
}

async function updateProjectRecord(req, res, next) {
  const project = await db.Project.findOne({ where: { id: req.results.id } });
  if (!(project && project.can && project.can('update')))
    return next(new Error('You cannot update this project'));

  req.pendingMessages = [
    { key: `project-${project.id}-update`, value: 'event' },
  ];
  if ('url' in req.body && req.body.url != project.url)
    req.pendingMessages.push({ key: `project-urls-update`, value: 'event' });

  let updateBody = req.body;

  if (req.body.url && req.body.url !== project.url) {
    try {
      let providers = await authSettings.providers({ project });
      for (let provider of providers) {
        let authConfig = await authSettings.config({
          project,
          useAuth: provider,
        });
        let adapter = await authSettings.adapter({ authConfig });
        if (adapter.service.updateClient) {
          let projectWithNewUrl = { ...project.toJSON(), url: req.body.url };
          await adapter.service.updateClient({
            authConfig,
            project: projectWithNewUrl,
          });
        }
      }
    } catch (err) {
      console.log(
        '[allowedDomains] Could not sync auth client after url change:',
        err.message
      );
    }
  }

  project
    .authorizeData(req.body, 'update')
    .update(updateBody)
    .then(async (result) => {
      req.results = result;
      try {
        await checkHostStatus({ id: result.id });
      } catch (err) {
        console.log('Ignore checkHostStatus error', err);
      }
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
      next(err);
      return null;
    });
}

async function publishProjectUpdateMessages(req, res, next) {
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
}

function respondUpdatedProject(req, res, next) {
  res.json(req.results);
}

async function deleteProject(req, res, next) {
  const project = await db.Project.findOne({
    where: { id: req.params.projectId },
  });
  if (!project) return next(new Error('Project not found'));
  if (!project?.config?.project?.projectHasEnded) {
    return next(new Error('Project has not ended yet'));
  }

  try {
    // Clean up K8s ExternalSecret if project used external certificates
    await projectCertificates.cleanupExternalSecretOnDelete(project);

    await project.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// Anonymize all users
// ----------------------------------------------------------------------------

function loadProjectForAnonymize(req, res, next) {
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
}

async function anonymizeAllUsers(req, res, next) {
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
}

function attachUserToAnonymizeResults(req, res, next) {
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
}

function respondAnonymizeResults(req, res, next) {
  res.json(req.results);
}

// ----------------------------------------------------------------------------
// CSS
// ----------------------------------------------------------------------------

function getProjectCss(req, res, next) {
  let css = req.project?.config?.project?.cssCustom || '';

  if (req.params.componentId) {
    css += `\n\n#${req.params.componentId} { width: 100%; height: 100%; }`;
  }

  res.setHeader('Content-Type', 'text/css');
  res.send(css);
}

function getWidgetCss(req, res, next) {
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
    } catch (err) {
      console.error(
        `Could not read widget css file ${widgetSettings.packageName}/${file}:`,
        err.message
      );
    }
  });

  res.setHeader('Content-Type', 'text/css');
  res.send(css);
}

// ----------------------------------------------------------------------------
// Certificate retry
// ----------------------------------------------------------------------------

async function retryCertificate(req, res, next) {
  try {
    // Feature gate
    if (!projectCertificates.isEnabled()) {
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
    const remainingSeconds =
      projectCertificates.getRetryCooldownRemaining(projectId);
    if (remainingSeconds) {
      return res.status(429).json({
        error: `Retry cooldown active. Try again in ${remainingSeconds} seconds.`,
        retryAfter: remainingSeconds,
      });
    }

    // Set cooldown with auto-cleanup to prevent memory leak
    projectCertificates.startRetryCooldown(projectId);

    const result = await projectCertificates.performCertificateRetry(project);

    return res.json(result);
  } catch (error) {
    console.error(
      '[external-certificates] Retry failed for project %s',
      String(req.params.projectId)
    );
    return res.status(500).json({ error: 'Certificate retry failed' });
  }
}

// ----------------------------------------------------------------------------
// PDF availability check
// ----------------------------------------------------------------------------

function getPdfStatus(req, res) {
  const available = !!process.env.PDF_API_ENDPOINT && !!process.env.PDF_API_KEY;
  res.json({ available });
}

async function getBranding(req, res) {
  try {
    let project = req.project;
    if (!project) return res.json({});

    let providers = await authSettings.providers({ project });
    for (let provider of providers) {
      if (provider === 'default') continue;
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
        return res.json({
          logo: client?.config?.styling?.logo || null,
        });
      }
    }

    return res.json({});
  } catch (err) {
    // Branding is non-critical; fail soft with an empty response but do log
    console.error('Could not fetch project branding:', err.message);
    return res.json({});
  }
}

module.exports = {
  checkUniqueUrl,
  loadProject,
  loadProjectForExport,
  setScope,
  deleteDuplicatedData,
  // list
  listProjectsAuthGate,
  rejectIncludeAuthConfigForList,
  listProjects,
  serializeProjectsList,
  // create
  prepareDuplicationPayload,
  createProjectRecord,
  syncAuthProvidersAfterCreate,
  createDuplicatedData,
  addCurrentUserAsAdmin,
  publishNewProjectEvent,
  respondCreatedProject,
  // issues
  initIssuesResults,
  addShouldHaveEndedIssues,
  addEndedNotAnonymizedIssues,
  addBlockedDomainsIssues,
  serializeIssuesList,
  // single project
  viewProject,
  updateAuthClients,
  updateProjectRecord,
  publishProjectUpdateMessages,
  respondUpdatedProject,
  deleteProject,
  // anonymize
  loadProjectForAnonymize,
  anonymizeAllUsers,
  attachUserToAnonymizeResults,
  respondAnonymizeResults,
  // css
  getProjectCss,
  getWidgetCss,
  // certificate
  retryCertificate,
  // pdf
  getPdfStatus,
  // branding
  getBranding,
};
