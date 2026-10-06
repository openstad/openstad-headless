function isDetailPageUrl(value) {
  return typeof value === 'string' && /^(\/|https?:\/\/)/i.test(value.trim());
}

function byTagOrder(a, b) {
  const seqA = Number.isFinite(a.seqnr) ? a.seqnr : Number.MAX_SAFE_INTEGER;
  const seqB = Number.isFinite(b.seqnr) ? b.seqnr : Number.MAX_SAFE_INTEGER;
  return seqA - seqB || a.id - b.id;
}

function detailUrlFromTags(resourceId, tags) {
  const tag = [...(tags || [])]
    .sort(byTagOrder)
    .find((candidate) => isDetailPageUrl(candidate.detailPageUrl));
  if (!tag) return null;
  return tag.detailPageUrl
    .trim()
    .split('[id]')
    .join(encodeURIComponent(String(resourceId)));
}

function absoluteUrl(url, project) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (!project || !project.url) return null;
  const protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
  const base = /^https?:\/\//i.test(project.url)
    ? project.url
    : `${protocol}${project.url}`;
  return `${base.replace(/\/+$/, '')}${url}`;
}

function resolvedDetailUrl(resourceId, tags, project) {
  const url = detailUrlFromTags(resourceId, tags);
  return url ? absoluteUrl(url, project) || url : null;
}

async function detailUrlsFor({ project, resourceIds, transaction }) {
  const db = require('../db');
  const ids = [...new Set((resourceIds || []).filter(Boolean))];
  if (!ids.length) return new Map();
  const resources = await db.Resource.unscoped().findAll({
    where: { id: ids, projectId: project.id },
    attributes: ['id'],
    include: [
      {
        model: db.Tag,
        attributes: ['id', 'seqnr', 'detailPageUrl'],
        through: { attributes: [] },
      },
    ],
    transaction,
  });
  return new Map(
    resources.map((resource) => [
      resource.id,
      resolvedDetailUrl(resource.id, resource.tags, project),
    ])
  );
}

module.exports = {
  absoluteUrl,
  detailUrlFromTags,
  detailUrlsFor,
  isDetailPageUrl,
  resolvedDetailUrl,
};
