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

function normalizeImages(value) {
  return parseArrayLikeJsonValue(value)
    .map((entry) => {
      if (typeof entry !== 'string') return entry;
      const { url, label } = splitUrlAnnotation(entry.trim());
      return label ? { url, description: label } : { url };
    })
    .filter(
      (entry) =>
        entry && typeof entry === 'object' && asString(entry.url).trim()
    )
    .map((entry) => {
      const cleaned = { url: asString(entry.url).trim() };
      if (entry.name)
        cleaned.name = sanitize.noTags(asString(entry.name).trim());
      if (entry.description) {
        cleaned.description = sanitize.noTags(
          asString(entry.description).trim()
        );
      }
      return cleaned;
    });
}

function normalizeDocuments(value) {
  return parseArrayLikeJsonValue(value)
    .map((entry) => {
      if (typeof entry !== 'string') return entry;
      const { url, label } = splitUrlAnnotation(entry.trim());
      return label ? { url, name: label } : { url };
    })
    .filter(
      (entry) =>
        entry && typeof entry === 'object' && asString(entry.url).trim()
    )
    .map((entry) => {
      const cleaned = { url: asString(entry.url).trim() };
      if (entry.name)
        cleaned.name = sanitize.noTags(asString(entry.name).trim());
      if (entry.mimeType) {
        cleaned.mimeType = sanitize.noTags(asString(entry.mimeType).trim());
      }
      const size = Number(entry.size);
      if (Number.isFinite(size)) cleaned.size = size;
      return cleaned;
    });
}

module.exports = { normalizeImages, normalizeDocuments };
