const db = require('../db');

const MAX_VERSIONS = 25;

function resolveUserName(user) {
  if (!user) return null;
  return user.displayName || user.name || user.email || null;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function isSameConfig(a, b) {
  return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b));
}

function selectPruneIds(orderedNewestFirst, max) {
  if (orderedNewestFirst.length <= max) return [];
  return orderedNewestFirst.slice(max).map((v) => v.id);
}

async function pruneVersions(widgetId) {
  const versions = await db.WidgetVersion.findAll({
    where: { widgetId, pinned: false },
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
    attributes: ['id'],
    raw: true,
  });

  const idsToDelete = selectPruneIds(versions, MAX_VERSIONS);
  if (idsToDelete.length === 0) return;

  await db.WidgetVersion.destroy({ where: { id: idsToDelete } });
}

async function snapshotWidgetVersion(widget, user) {
  try {
    const config = widget.config;

    const latest = await db.WidgetVersion.findOne({
      where: { widgetId: widget.id },
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      raw: true,
    });

    if (latest && isSameConfig(latest.config, config)) {
      return null;
    }

    const version = await db.WidgetVersion.create({
      projectId: widget.projectId,
      widgetId: widget.id,
      config,
      userId: user && user.id ? user.id : null,
      userName: resolveUserName(user),
    });

    await pruneVersions(widget.id);

    return version;
  } catch (err) {
    console.error('Failed to snapshot widget version:', {
      error: err.message,
      widgetId: widget && widget.id,
      projectId: widget && widget.projectId,
    });
    return null;
  }
}

module.exports = {
  snapshotWidgetVersion,
  pruneVersions,
  resolveUserName,
  isSameConfig,
  selectPruneIds,
  MAX_VERSIONS,
};
