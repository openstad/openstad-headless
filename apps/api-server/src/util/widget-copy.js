const db = require('../db');
const { Op } = require('sequelize');
const hasRole = require('../lib/sequelize-authorization/lib/hasRole');
const {
  canUserUseSourceProjectForDuplication,
} = require('../services/authClientSync');
const { remapWidgetConfigForProject } = require('./widget-config-remap');
const {
  tagIdentity,
  statusIdentity,
  markerSetIdentity,
  buildIdMap,
} = require('./widget-copy-matching');

// Whether the user is an admin or editor of the given project.
//
// A role check alone is not enough: `req.user.role` comes from a User row that,
// for fixed API tokens, is not scoped to the project in the URL. So membership
// of the project is verified explicitly.
async function hasProjectMembership({ user, projectId }) {
  if (hasRole(user, 'superuser')) return true;

  const identifier = user?.idpUser?.identifier;
  const provider = user?.idpUser?.provider;
  if (!identifier || !provider) return false;

  const projectUser = await db.User.findOne({
    where: {
      projectId,
      idpUser: { identifier, provider },
      [Op.or]: [{ role: 'admin' }, { role: 'editor' }],
    },
  });

  return !!projectUser;
}

// Whether the user may create content in targetProjectId. Copying widgets INTO a
// project is a write, so the target is verified the same way as the source.
async function canUserWriteToProject({ user, targetProjectId }) {
  return hasProjectMembership({ user, projectId: targetProjectId });
}

// Global tags live at projectId 0 -- see the `forProjectId` scope in models/Tag.js
// -- and the admin tag pickers offer them alongside a project's own tags, so a
// widget can reference one. Their ids are already valid in the target project.
const GLOBAL_TAG_PROJECT_ID = 0;

// Builds the id maps for a widget copy between two DIFFERENT projects, by
// matching the source project's rows to the target project's equivalents by name.
// Unmatched and ambiguous ones are absent from the returned maps, which makes the
// remap clear those references rather than point them at the source project.
async function buildTargetMaps(sourceProjectId, targetProjectId) {
  const [
    sourceTags,
    targetTags,
    globalTags,
    sourceStatuses,
    targetStatuses,
    sourceMarkerSets,
    targetMarkerSets,
  ] = await Promise.all([
    db.Tag.findAll({ where: { projectId: sourceProjectId } }),
    db.Tag.findAll({ where: { projectId: targetProjectId } }),
    db.Tag.findAll({ where: { projectId: GLOBAL_TAG_PROJECT_ID } }),
    // Statuses have no global equivalent; see models/Status.js.
    db.Status.findAll({ where: { projectId: sourceProjectId } }),
    db.Status.findAll({ where: { projectId: targetProjectId } }),
    // A marker set belongs to a project (models/Markers.js associates Project),
    // and a map widget stores `markerSets: [{ id, name }]`.
    db.Markers.findAll({ where: { projectId: sourceProjectId } }),
    db.Markers.findAll({ where: { projectId: targetProjectId } }),
  ]);

  // A global tag maps onto itself, and it has to do so unconditionally rather
  // than by name: matching by name breaks as soon as the target project owns a
  // tag with the same type and name, because that identity then reads as
  // ambiguous and the reference would be cleared for no reason.
  const tagMap = buildIdMap(sourceTags, targetTags, tagIdentity);
  globalTags.forEach((tag) => {
    tagMap[tag.id] = tag.id;
  });

  return {
    tagMap,
    statusMap: buildIdMap(sourceStatuses, targetStatuses, statusIdentity),
    markerSetMap: buildIdMap(
      sourceMarkerSets,
      targetMarkerSets,
      markerSetIdentity
    ),
  };
}

module.exports = {
  canUserUseSourceProjectForDuplication,
  canUserWriteToProject,
  remapWidgetConfigForProject,
  buildTargetMaps,
};
