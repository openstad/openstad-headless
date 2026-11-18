/**
 * Resource tags/statuses service.
 *
 * Validates that given tag/status ids belong to the project (tags may
 * optionally be global, projectId 0) and extracts ids from object arrays.
 * Extracted from routes/api/resource.js (#1640). No Express `req`.
 */
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const db = require('../db');

// Get all valid tags of the project based on given ids (optionally incl. global).
async function getValidTags(projectId, tags, canBeGlobal) {
  const uniqueIds = Array.from(new Set(tags));

  const whereClause = {
    id: { [Op.in]: uniqueIds },
    projectId: canBeGlobal ? { [Op.or]: [projectId, 0] } : projectId,
  };

  const tagsOfProject = await db.Tag.findAll({ where: whereClause });

  return tagsOfProject;
}

// Get all valid statuses of the project based on given ids.
async function getValidStatuses(projectId, statuses) {
  const uniqueIds = Array.from(new Set(statuses));

  const statusesOfProject = await db.Status.findAll({
    where: { projectId, id: { [Op.in]: uniqueIds } },
  });

  return statusesOfProject;
}

// Get all ids from an array of objects (string ids parsed to int; non-objects dropped).
function getOnlyIds(objArr) {
  return objArr
    .map((obj) => {
      if (typeof obj === 'object' && obj?.id) {
        let objId = obj?.id;
        if (typeof objId === 'string') {
          objId = parseInt(objId);
        }

        return objId;
      }
      return false;
    })
    .filter((obj) => obj !== false);
}

module.exports = {
  getValidTags,
  getValidStatuses,
  getOnlyIds,
};
