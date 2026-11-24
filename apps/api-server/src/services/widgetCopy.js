const db = require('../db');
const { remapConfig } = require('./widgetConfigReferences');

const GLOBAL_TAG_PROJECT_ID = 0;

async function copyWidgetsBetweenProjects({ sourceWidgets, targetProjectId }) {
  return db.sequelize.transaction(async (transaction) => {
    const globalTags = await db.Tag.findAll({
      where: { projectId: GLOBAL_TAG_PROJECT_ID },
      attributes: ['id'],
      transaction,
    });
    const tagMap = {};
    globalTags.forEach((tag) => {
      tagMap[tag.id] = tag.id;
    });

    const widgetMap = {};
    const copies = [];
    for (const widget of sourceWidgets) {
      const copy = await db.Widget.create(
        {
          projectId: targetProjectId,
          description: widget.description,
          type: widget.type,
          config: widget.config,
        },
        { transaction }
      );
      widgetMap[widget.id] = copy.id;
      copies.push(copy);
    }

    const cleared = [];
    for (const copy of copies) {
      const config = JSON.parse(JSON.stringify(copy.config));
      const { clearedKeys } = remapConfig(config, {
        tagMap,
        statusMap: {},
        markerSetMap: {},
        widgetMap,
        targetProjectId,
      });
      config.projectId = targetProjectId;
      await copy.update({ config }, { transaction });

      if (clearedKeys.length) {
        cleared.push({
          id: copy.id,
          description: copy.description,
          keys: clearedKeys,
        });
      }
    }

    return { widgets: copies, cleared };
  });
}

module.exports = {
  copyWidgetsBetweenProjects,
};
