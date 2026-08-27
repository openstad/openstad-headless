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

function normalizeImages(value) {
  return toMediaItems(value, 'description').map((item) => {
    const cleaned = { url: item.url };
    if (item.name) cleaned.name = cleanText(item.name);
    if (item.description) cleaned.description = cleanText(item.description);
    return cleaned;
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

module.exports = { normalizeImages, normalizeDocuments };
