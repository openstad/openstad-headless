const createError = require('http-errors');
const db = require('../db');
const hasRole = require('../lib/sequelize-authorization/lib/hasRole');
const { attachModeratorOnlyExtraDataKeys } = require('./resourceExtraData');

const ALWAYS_PUBLIC_EXTRA_DATA_KEYS = ['originalId', 'ranking'];
const EXCLUDED_TEMPLATE_FIELD_TYPES = [
  'text',
  'phone',
  'advice',
  'role',
  'estimate',
];

function keepPublicExtraData(resources) {
  if (!Array.isArray(resources)) return resources;

  for (const resource of resources) {
    if (
      !resource ||
      typeof resource.extraData !== 'object' ||
      resource.extraData === null
    ) {
      continue;
    }

    const fieldKeys = Array.isArray(resource.resourceFormFieldKeys)
      ? resource.resourceFormFieldKeys
      : [];
    const moderatorOnly = Array.isArray(resource.moderatorOnlyExtraDataKeys)
      ? resource.moderatorOnlyExtraDataKeys
      : [];
    const fieldTypes =
      resource.resourceFormFieldTypes &&
      typeof resource.resourceFormFieldTypes === 'object'
        ? resource.resourceFormFieldTypes
        : {};
    const publicKeys = new Set([
      ...fieldKeys.filter(
        (key) =>
          !moderatorOnly.includes(key) &&
          !EXCLUDED_TEMPLATE_FIELD_TYPES.includes(fieldTypes[key])
      ),
      ...ALWAYS_PUBLIC_EXTRA_DATA_KEYS,
    ]);

    for (const key of Object.keys(resource.extraData)) {
      if (!publicKeys.has(key)) delete resource.extraData[key];
    }
  }

  return resources;
}

const normalizeUserId = (userId) =>
  typeof userId === 'number' && Number.isInteger(userId)
    ? userId
    : typeof userId === 'string' && /^\d+$/.test(userId)
      ? parseInt(userId, 10)
      : null;

async function anonymizeResourceOwners(resources) {
  if (!Array.isArray(resources)) return resources;

  const userIds = [
    ...new Set(
      resources
        .filter((resource) => resource && typeof resource === 'object')
        .map((resource) => normalizeUserId(resource.userId))
        .filter((id) => id !== null)
    ),
  ];

  const users = userIds.length
    ? await db.User.findAll({
        where: { id: userIds },
        attributes: ['id', 'role'],
      })
    : [];
  const roleByUserId = Object.fromEntries(
    users.map((user) => [user.id, user.role])
  );

  for (const resource of resources) {
    if (!resource || typeof resource !== 'object') continue;
    delete resource.user;

    const normalizedUserId = normalizeUserId(resource.userId);
    const role =
      normalizedUserId === null ? null : roleByUserId[normalizedUserId];
    if (!role || !hasRole({ role }, 'editor')) {
      resource.userId = 'anonymous';
    }
  }

  return resources;
}

function toSnapshotItem(instance) {
  const item = instance.get({ plain: true });
  if (item.deletedAt) return null;
  delete item.projectId;
  item.originalId = item.id;
  delete item.id;
  return item;
}

async function fetchSnapshotList(model, projectId, options = {}) {
  const rows = await model.findAll({ where: { projectId }, ...options });
  return rows.map(toSnapshotItem).filter(Boolean);
}

async function buildProjectTemplateSnapshot(projectId) {
  const project =
    await db.Project.scope('includeEmailConfig').findByPk(projectId);
  if (!project) throw createError(404, 'Source project not found');

  const payload = {
    areaId: project.areaId,
    config: project.config || {},
    emailConfig: project.emailConfig,
    hostStatus: project.hostStatus,
    title: project.title,
    widgets: [],
    tags: [],
    statuses: [],
    resources: [],
    notificationTemplates: [],
    resourceSettings: false,
    skipDefaultStatuses: true,
  };

  if (payload.config && payload.config.uniqueId) {
    delete payload.config.uniqueId;
  }

  payload.widgets = await fetchSnapshotList(db.Widget, projectId);
  payload.tags = await fetchSnapshotList(db.Tag, projectId);
  payload.statuses = await fetchSnapshotList(db.Status, projectId);
  const resourceRows = await db.Resource.scope(
    'defaultScope',
    'includeTags'
  ).findAll({ where: { projectId } });
  const resourceItems = resourceRows
    .map((row) => row.get({ plain: true }))
    .filter((item) => !item.deletedAt);
  await attachModeratorOnlyExtraDataKeys(resourceItems);
  keepPublicExtraData(resourceItems);
  payload.resources = resourceItems.map((item) => {
    delete item.hasResourceFormConfig;
    delete item.resourceFormFieldKeys;
    delete item.moderatorOnlyExtraDataKeys;
    delete item.resourceFormFieldTypes;
    delete item.projectId;
    item.originalId = item.id;
    delete item.id;
    return item;
  });
  payload.notificationTemplates = await fetchSnapshotList(
    db.NotificationTemplate,
    projectId
  );

  payload.resourceSettings = payload?.config?.resources || {};

  if (Array.isArray(payload.resources) && payload.resources.length > 0) {
    payload.config = payload.config || {};
    payload.config.resources = payload.config.resources || {};
    payload.config.resources.canAddNewResources = true;

    payload.config.resources.titleMaxLength = 10000;
    payload.config.resources.titleMinLength = 1;
    payload.config.resources.summaryMaxLength = 10000;
    payload.config.resources.summaryMinLength = 1;
    payload.config.resources.descriptionMaxLength = 10000;
    payload.config.resources.descriptionMinLength = 1;
  }

  return payload;
}

module.exports = {
  anonymizeResourceOwners,
  keepPublicExtraData,
  buildProjectTemplateSnapshot,
};
