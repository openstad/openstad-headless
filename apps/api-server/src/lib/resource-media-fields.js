const sanitize = require('../util/sanitize');

const asString = (v) =>
  typeof v === 'string' ? v : v == null ? '' : String(v);

function parseArrayLikeJsonValue(value) {
  if (value == null || value === '') return [];

  let parsed = value;

  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    if (!trimmed) return [];
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      try {
        parsed = JSON.parse(`[${trimmed}]`);
      } catch (err2) {
        parsed = trimmed
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
  }

  return Array.isArray(parsed) ? parsed : [parsed];
}

function splitUrlAnnotation(str) {
  const match = str.match(/^(.*\S)\s+\(([^()]+)\)\s*$/);
  if (match) return { url: match[1], label: match[2] };
  return { url: str, label: '' };
}

function annotatedUrlToItem(str, annotationKey) {
  const { url, label } = splitUrlAnnotation(str.trim());
  return label ? { url, [annotationKey]: label } : { url };
}

function cleanText(value) {
  return sanitize.noTags(asString(value).trim());
}

function toMediaItems(value, annotationKey) {
  const items = [];

  for (const entry of parseArrayLikeJsonValue(value)) {
    const item =
      typeof entry === 'string'
        ? annotatedUrlToItem(entry, annotationKey)
        : entry;

    if (!item || typeof item !== 'object') continue;

    const url = asString(item.url).trim();
    if (url) items.push({ ...item, url });
  }

  return items;
}

const roundOneDecimal = (n) => Math.round(n * 10) / 10;
const clampPercent = (n) => roundOneDecimal(Math.min(100, Math.max(0, n)));

function cleanFocalPoint(fp) {
  if (!fp || typeof fp !== 'object') return null;
  if (fp.x === null || fp.y === null || fp.x === '' || fp.y === '') return null;
  const x = Number(fp.x);
  const y = Number(fp.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: clampPercent(x), y: clampPercent(y) };
}

function normalizeImages(value, previousImages) {
  const previous = Array.isArray(previousImages) ? previousImages : [];
  return toMediaItems(value, 'description').map((item) => {
    const cleaned = { url: item.url };
    if (item.name) cleaned.name = cleanText(item.name);
    if (item.description) cleaned.description = cleanText(item.description);

    let focalPoint = null;
    if (Object.prototype.hasOwnProperty.call(item, 'focalPoint')) {
      focalPoint = cleanFocalPoint(item.focalPoint);
    } else {
      const prev = previous.find((p) => p && p.url === item.url);
      focalPoint = prev ? cleanFocalPoint(prev.focalPoint) : null;
    }
    if (focalPoint) cleaned.focalPoint = focalPoint;
    return cleaned;
  });
}

function stripFocalPoints(value) {
  return toMediaItems(value, 'description').map((item) => {
    const { focalPoint, ...rest } = item;
    return rest;
  });
}

function normalizeDocuments(value) {
  return toMediaItems(value, 'name').map((item) => {
    const cleaned = { url: item.url };
    if (item.name) cleaned.name = cleanText(item.name);
    if (item.mimeType) cleaned.mimeType = cleanText(item.mimeType);
    const size = Number(item.size);
    if (Number.isFinite(size)) cleaned.size = size;
    return cleaned;
  });
}

module.exports = { normalizeImages, normalizeDocuments, stripFocalPoints };
