const crypto = require('crypto');

const MAX_URL_LENGTH = 2048;

// Normalize the page url a widget was loaded on: keep origin + path only
// (query string and fragment are stripped, so tokens/PII in the query are never stored)
function normalizeWidgetUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (e) {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  let pathname = parsed.pathname;
  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, '');
  }
  if (pathname === '') pathname = '/';

  return (parsed.origin.toLowerCase() + pathname).substring(0, MAX_URL_LENGTH);
}

function hashWidgetUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

// Record a successful widget load: one row per (projectId, widgetId, normalized url),
// bumping count + lastSeen on repeat visits
async function recordWidgetLoad(db, { widgetId, rawUrl }) {
  const url = normalizeWidgetUrl(rawUrl);
  if (!url) {
    return { status: 'invalid-url' };
  }

  const widget = await db.Widget.findOne({
    where: { id: widgetId },
    include: [db.Project],
  });

  if (!widget || !widget.project) {
    return { status: 'not-found' };
  }

  const urlHash = hashWidgetUrl(url);
  const where = {
    projectId: widget.project.id,
    widgetId: parseInt(widgetId, 10),
    urlHash,
  };

  const existing = await db.WidgetLoad.findOne({ where });
  if (existing) {
    await existing.update({
      count: existing.count + 1,
      lastSeen: new Date(),
    });
    return { status: 'updated' };
  }

  try {
    await db.WidgetLoad.create({ ...where, url });
  } catch (err) {
    // Race: a concurrent request created the row first; fall back to an increment
    if (err && err.name === 'SequelizeUniqueConstraintError') {
      const fallback = await db.WidgetLoad.findOne({ where });
      if (fallback) {
        await fallback.update({
          count: fallback.count + 1,
          lastSeen: new Date(),
        });
      }
      return { status: 'updated' };
    }
    throw err;
  }

  return { status: 'created' };
}

module.exports = {
  normalizeWidgetUrl,
  hashWidgetUrl,
  recordWidgetLoad,
};
