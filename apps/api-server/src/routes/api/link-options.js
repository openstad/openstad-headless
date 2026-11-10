const express = require('express');
const createError = require('http-errors');
const { Op } = require('sequelize');
const db = require('../../db');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const pluginExtensions = require('../../services/plugin-extensions');
const { OPENSTAD_SOURCE } = require('../../services/resource-links');

const router = express.Router({ mergeParams: true });

const MIN_SEARCH_LENGTH = 2;
const DEFAULT_LIMIT = 20;
const BROWSE_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_IDS = 50;

function parseIdList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function parseLimit(value, fallback = DEFAULT_LIMIT) {
  const limit = parseInt(value, 10);
  if (!Number.isFinite(limit)) return fallback;
  return Math.min(Math.max(limit, 1), MAX_LIMIT);
}

function escapeLike(word) {
  return word.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function toOption(user, resource) {
  const images = Array.isArray(resource.images) ? resource.images : [];
  const own = !!(user && user.id && resource.userId === user.id);
  return {
    id: String(resource.id),
    label: resource.title,
    ...(images[0] && images[0].url ? { image: images[0].url } : {}),
    ...(Array.isArray(resource.tags)
      ? { tagIds: resource.tags.map((tag) => String(tag.id)) }
      : {}),
    ...(own ? { own: true } : {}),
  };
}

function visibleResources(req, tagIds, extraScopes = []) {
  const scopes = [
    { method: ['onlyVisible', req.user.id, req.user.role] },
    ...extraScopes,
  ];
  if (tagIds.length) scopes.push({ method: ['selectTags', tagIds] });
  return db.Resource.scope(...scopes);
}

function getSourceOrThrow(key) {
  const source = pluginExtensions.get().getSource(key);
  if (!source) throw createError(404, 'Unknown link source');
  return source;
}

router.get('/:source', rateLimiter(), async function (req, res, next) {
  try {
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const onlyMine =
      req.query.mine === '1' && req.params.source === OPENSTAD_SOURCE;
    if (onlyMine && !req.user.id) {
      throw createError(401, 'You must be logged in to list your submissions');
    }
    const browsing =
      req.params.source === OPENSTAD_SOURCE && search.length === 0;
    if (!onlyMine && !browsing && search.length < MIN_SEARCH_LENGTH) {
      throw createError(
        422,
        `search must contain at least ${MIN_SEARCH_LENGTH} characters`
      );
    }
    const limit = parseLimit(
      req.query.limit,
      browsing && !onlyMine ? BROWSE_LIMIT : DEFAULT_LIMIT
    );
    const projectId = parseInt(req.params.projectId, 10);

    if (req.params.source !== OPENSTAD_SOURCE) {
      const source = getSourceOrThrow(req.params.source);
      const items = await source.search({
        project: req.project,
        query: search,
        limit,
      });
      return res.json(items);
    }

    const tagIds = parseIdList(req.query.tags);
    const excludeIds = parseIdList(req.query.exclude)
      .map((id) => parseInt(id, 10))
      .filter(Number.isFinite);
    const words = search.split(/\s+/).filter(Boolean);

    const resources = await visibleResources(req, tagIds).findAll({
      where: {
        projectId,
        publishDate: { [Op.ne]: null },
        ...(onlyMine ? { userId: req.user.id } : {}),
        [Op.and]: [
          ...words.map((word) => ({
            title: { [Op.like]: `%${escapeLike(word)}%` },
          })),
          ...(excludeIds.length ? [{ id: { [Op.notIn]: excludeIds } }] : []),
        ],
      },
      attributes: ['id', 'title', 'images', 'userId'],
      order: [['title', 'ASC']],
      limit,
    });

    res.json(resources.map((resource) => toOption(req.user, resource)));
  } catch (err) {
    next(err);
  }
});

router.get('/:source/items', rateLimiter(), async function (req, res, next) {
  try {
    const ids = parseIdList(req.query.ids);
    if (ids.length > MAX_IDS) {
      throw createError(422, `ids can contain at most ${MAX_IDS} items`);
    }
    if (!ids.length) return res.json([]);

    if (req.params.source !== OPENSTAD_SOURCE) {
      const source = getSourceOrThrow(req.params.source);
      return res.json(await source.get({ project: req.project, ids }));
    }

    const resourceIds = ids
      .map((id) => parseInt(id, 10))
      .filter(Number.isFinite);
    const resources = await visibleResources(req, [], ['includeTags']).findAll({
      where: {
        projectId: parseInt(req.params.projectId, 10),
        id: resourceIds,
        publishDate: { [Op.ne]: null },
      },
      attributes: ['id', 'title', 'images', 'userId'],
    });

    res.json(resources.map((resource) => toOption(req.user, resource)));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
