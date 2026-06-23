/**
 * Project duplication service.
 *
 * Pure(-ish) business logic for cloning a project's nested data (tags,
 * statuses, widgets, notification templates, resources and their users) into a
 * newly created project. Extracted from routes/api/project.js (#1640).
 *
 * These functions take explicit arguments instead of an Express `req` so they
 * can be unit-tested without HTTP. They accumulate failures into the passed
 * `errors` array rather than throwing, matching the original duplication flow.
 */
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const db = require('../db');

// Create tags for the duplicated project.
async function createTags(tags, projectId, tagMap, errors) {
  for (const tag of tags) {
    try {
      const newTag = await db.Tag.create({ ...tag, projectId });
      tagMap[tag.originalId] = newTag.id;
    } catch (error) {
      errors.push({ step: 'Create tags', error: error.message });
    }
  }
}

// Create statuses for the duplicated project.
async function createStatuses(statuses, projectId, statusMap, errors) {
  for (const status of statuses) {
    try {
      const newStatus = await db.Status.create({ ...status, projectId });
      statusMap[status.originalId] = newStatus.id;
    } catch (error) {
      errors.push({ step: 'Create statuses', error: error.message });
    }
  }
}

// Create notification templates for the duplicated project.
async function createNotificationTemplates(
  notificationTemplates,
  projectId,
  errors
) {
  for (const template of notificationTemplates) {
    try {
      // eslint-disable-next-line no-unused-vars
      const { originalId, ...templateData } = template;
      // Skip afterCreate hooks: auth client sync is already handled by the
      // auth provider sync earlier in the duplication flow.
      await db.NotificationTemplate.create(
        { ...templateData, projectId },
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

// Create widgets for the duplicated project.
async function createWidgets(
  widgets,
  projectId,
  widgetMap,
  newWidgets,
  errors
) {
  for (const widget of widgets) {
    try {
      const newWidget = await db.Widget.create({ ...widget, projectId });
      widgetMap[widget.originalId] = newWidget.id;
      newWidgets.push(newWidget);
    } catch (error) {
      errors.push({ step: 'Create widgets', error: error.message });
    }
  }
}

// Get an existing user (by id or idpUser) or create a clone in the new project.
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

// Create resources for the duplicated project, remapping widget/user/tag/status ids.
async function createResources(
  resources,
  projectId,
  resourceMap,
  widgetMap,
  tagMap,
  statusMap,
  userMap,
  createdUserIds,
  errors
) {
  for (const resource of resources) {
    try {
      const updateWidgetIdsInResource = (singleResource) => {
        for (const key in singleResource) {
          if (
            typeof singleResource[key] === 'object' &&
            singleResource[key] !== null
          ) {
            updateWidgetIdsInResource(singleResource[key]);
          } else if (key === 'widgetId') {
            singleResource[key] = widgetMap[singleResource[key]];
          }
        }
        return singleResource;
      };

      const updatedResource = updateWidgetIdsInResource(resource);

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
          projectId,
          createdUserIds
        );
      }

      const newResource = await db.Resource.create({
        ...updatedResource,
        projectId,
      });
      resourceMap[resource.originalId] = newResource.id;

      if (resource.tags) {
        const validTagIds = await getValidTags(
          projectId,
          resource.tags.map((tag) => tagMap[tag.id])
        );
        await newResource.setTags(validTagIds);
      }
      if (resource.statuses) {
        const validStatusIds = await getValidStatuses(
          projectId,
          resource.statuses.map((status) => statusMap[status.id])
        );
        await newResource.setStatuses(validStatusIds);
      }
    } catch (error) {
      errors.push({ step: 'Create resources', error: error.message });
    }
  }
}

// Recursively remap ids (project/resource/tag/status/choiceguideWidget) inside a config object.
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

// Update a single widget's data.
async function updateWidget(widgetId, updatedData, errors) {
  try {
    await db.Widget.update(updatedData, { where: { id: widgetId } });
  } catch (error) {
    errors.push({ step: 'Update widget', error: error.message });
  }
}

// Remap ids inside the config of all newly created widgets.
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

// Restore the project's resource settings config after duplication.
async function revertConfigResourceSettings(
  projectId,
  resourceSettings,
  errors
) {
  try {
    const project = await db.Project.findOne({ where: { id: projectId } });
    const newConfig = project?.config || {};
    newConfig.resources = resourceSettings || {};

    await project.update({ config: newConfig });
  } catch (error) {
    errors.push({
      step: 'Revert config resource settings',
      error: error.message,
    });
  }
}

// Return the status records that actually belong to the project.
async function getValidStatuses(projectId, statuses) {
  const uniqueIds = Array.from(new Set(statuses));

  const statusesOfProject = await db.Status.findAll({
    where: { projectId, id: { [Op.in]: uniqueIds } },
  });

  return statusesOfProject;
}

// Return the tag ids that actually belong to the project.
async function getValidTags(projectId, tags) {
  const uniqueIds = Array.from(new Set(tags));
  const validTags = await db.Tag.findAll({
    where: { id: uniqueIds, projectId },
  });
  return validTags.map((tag) => tag.id);
}

module.exports = {
  createTags,
  createStatuses,
  createNotificationTemplates,
  createWidgets,
  getOrCreateUser,
  createResources,
  updateWidgetIds,
  updateWidget,
  updateWidgetIdsInNewWidgets,
  revertConfigResourceSettings,
  getValidStatuses,
  getValidTags,
};
