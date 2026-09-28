const createError = require('http-errors');
const { Op } = require('sequelize');
const db = require('../db');

const OPENSTAD_SOURCE = 'openstad';
const SOURCE_PATTERN = /^[a-z0-9-]{1,64}$/;
const LINKED_RESOURCE_ATTRIBUTES = [
  'id',
  'projectId',
  'title',
  'summary',
  'images',
  'publishDate',
];

function incomingWhere(projectId, resourceId) {
  return {
    projectId,
    targetSource: OPENSTAD_SOURCE,
    targetId: String(resourceId),
  };
}

function toLinkedResource(resource) {
  return {
    id: resource.id,
    title: resource.title,
    summary: resource.summary,
    images: resource.images,
    tags: (resource.tags || []).map((tag) => ({
      id: tag.id,
      name: tag.name,
      type: tag.type,
    })),
  };
}

async function listLinks({ projectId, resourceId, user }) {
  const [outgoing, incoming] = await Promise.all([
    db.ResourceLink.findAll({ where: { projectId, resourceId } }),
    db.ResourceLink.findAll({ where: incomingWhere(projectId, resourceId) }),
  ]);

  const linkedIds = [
    ...outgoing
      .filter((link) => link.targetSource === OPENSTAD_SOURCE)
      .map((link) => parseInt(link.targetId, 10)),
    ...incoming.map((link) => link.resourceId),
  ];

  const visibleResources = linkedIds.length
    ? await db.Resource.scope('includeTags', {
        method: ['onlyVisible', user.id, user.role],
      }).findAll({
        where: { id: linkedIds, projectId },
        attributes: LINKED_RESOURCE_ATTRIBUTES,
      })
    : [];
  const resourcesById = new Map(
    visibleResources.map((resource) => [resource.id, resource])
  );

  const outgoingLinks = outgoing.flatMap((link) => {
    if (link.targetSource !== OPENSTAD_SOURCE) {
      return [
        {
          id: link.id,
          direction: 'outgoing',
          source: link.targetSource,
          targetId: link.targetId,
        },
      ];
    }
    const resource = resourcesById.get(parseInt(link.targetId, 10));
    return resource
      ? [
          {
            id: link.id,
            direction: 'outgoing',
            source: OPENSTAD_SOURCE,
            targetId: link.targetId,
            resource: toLinkedResource(resource),
          },
        ]
      : [];
  });

  const incomingLinks = incoming.flatMap((link) => {
    const resource = resourcesById.get(link.resourceId);
    return resource
      ? [
          {
            id: link.id,
            direction: 'incoming',
            source: OPENSTAD_SOURCE,
            targetId: String(link.resourceId),
            resource: toLinkedResource(resource),
          },
        ]
      : [];
  });

  return [...outgoingLinks, ...incomingLinks];
}

async function createLink({
  projectId,
  resourceId,
  targetSource,
  targetId,
  transaction,
}) {
  const source = typeof targetSource === 'string' ? targetSource : '';
  const target =
    targetId === undefined || targetId === null ? '' : String(targetId);

  if (!SOURCE_PATTERN.test(source)) {
    throw createError(422, 'Invalid targetSource');
  }
  if (!target || target.length > 255) {
    throw createError(422, 'Invalid targetId');
  }

  if (source === OPENSTAD_SOURCE) {
    if (!/^\d+$/.test(target)) {
      throw createError(422, 'Invalid targetId');
    }
    if (parseInt(target, 10) === resourceId) {
      throw createError(422, 'A resource cannot be linked to itself');
    }
    const targetResource = await db.Resource.findOne({
      where: { id: parseInt(target, 10), projectId },
      transaction,
    });
    if (!targetResource) {
      throw createError(404, 'Target resource not found');
    }
  }

  const duplicateConditions = [
    { resourceId, targetSource: source, targetId: target },
  ];
  if (source === OPENSTAD_SOURCE) {
    duplicateConditions.push({
      resourceId: parseInt(target, 10),
      targetSource: OPENSTAD_SOURCE,
      targetId: String(resourceId),
    });
  }
  const duplicate = await db.ResourceLink.findOne({
    where: { projectId, [Op.or]: duplicateConditions },
    transaction,
  });
  if (duplicate) {
    throw createError(409, 'Link already exists');
  }

  try {
    return await db.ResourceLink.create(
      {
        projectId,
        resourceId,
        targetSource: source,
        targetId: target,
      },
      { transaction }
    );
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw createError(409, 'Link already exists');
    }
    throw err;
  }
}

async function removeLink({ projectId, resourceId, linkId, transaction }) {
  const link = await db.ResourceLink.findOne({
    where: {
      id: linkId,
      projectId,
      [Op.or]: [{ resourceId }, incomingWhere(projectId, resourceId)],
    },
    transaction,
  });
  if (!link) {
    throw createError(404, 'Link not found');
  }
  await link.destroy({ transaction });
}

module.exports = { OPENSTAD_SOURCE, listLinks, createLink, removeLink };
