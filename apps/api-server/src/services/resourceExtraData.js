/**
 * Resource extra-data service.
 *
 * Computes, per resource, which resourceform extra-data fields exist and which
 * are moderator-only, by reading the linked resourceform widget config.
 * Extracted from routes/api/resource.js (#1640). No Express `req`.
 */
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const db = require('../db');

// Derive the (unique) field keys and the moderator-only field keys from a
// resourceform widget config.
function getResourceFormExtraDataConfig(widgetConfig) {
  const items = Array.isArray(widgetConfig?.items) ? widgetConfig.items : [];
  const uniqueFieldKeys = new Set();
  const moderatorOnlyFieldKeys = new Set();

  for (const item of items) {
    if (typeof item.fieldKey !== 'string') continue;
    uniqueFieldKeys.add(item.fieldKey);
    if (item?.onlyForModerator) {
      moderatorOnlyFieldKeys.add(item.fieldKey);
    }
  }

  return {
    fieldKeys: Array.from(uniqueFieldKeys),
    moderatorOnlyFieldKeys: Array.from(moderatorOnlyFieldKeys),
  };
}

// Attach hasResourceFormConfig / resourceFormFieldKeys / moderatorOnlyExtraDataKeys
// to each resource (single record or array) based on its resourceform widget.
async function attachModeratorOnlyExtraDataKeys(resources) {
  const records = Array.isArray(resources) ? resources : [resources];
  const activeRecords = records.filter(Boolean);
  if (!activeRecords.length) return;

  const projectIds = Array.from(
    new Set(
      activeRecords
        .map((resource) => Number(resource.projectId))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  );
  const widgetIds = Array.from(
    new Set(
      activeRecords
        .map((resource) => Number(resource.widgetId))
        .filter((widgetId) => Number.isInteger(widgetId) && widgetId > 0)
    )
  );

  if (!widgetIds.length || !projectIds.length) {
    activeRecords.forEach((resource) => {
      resource.hasResourceFormConfig = false;
      resource.resourceFormFieldKeys = [];
      resource.moderatorOnlyExtraDataKeys = [];
    });
    return;
  }

  const widgets = await db.Widget.findAll({
    where: {
      id: { [Op.in]: widgetIds },
      projectId: { [Op.in]: projectIds },
      type: 'resourceform',
    },
    attributes: ['id', 'projectId', 'config'],
  });

  const extraDataConfigByWidgetId = new Map();
  widgets.forEach((widget) => {
    const widgetLookupKey = `${widget.projectId}:${widget.id}`;
    extraDataConfigByWidgetId.set(
      widgetLookupKey,
      getResourceFormExtraDataConfig(widget.config || {})
    );
  });

  activeRecords.forEach((resource) => {
    const resourceLookupKey = `${resource.projectId}:${resource.widgetId}`;
    const extraDataConfig = extraDataConfigByWidgetId.get(resourceLookupKey);
    resource.hasResourceFormConfig = !!extraDataConfig;
    resource.resourceFormFieldKeys = extraDataConfig?.fieldKeys || [];
    resource.moderatorOnlyExtraDataKeys =
      extraDataConfig?.moderatorOnlyFieldKeys || [];
  });
}

module.exports = {
  getResourceFormExtraDataConfig,
  attachModeratorOnlyExtraDataKeys,
};
