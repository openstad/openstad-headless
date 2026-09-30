// Global defaults a new project inherits unless it sets its own value. Only non-empty
// values are copied, so an unset global still falls back to the project schema default.

const INHERITED_STYLING_KEYS = ['logo', 'favicon'];
const INHERITED_NOTIFICATION_KEYS = ['fromAddress', 'fromName', 'replyTo'];
const INHERITED_LOGIN_KEYS = ['fromAddress', 'fromName', 'helpAddress'];

// Pure half, split out so it can be tested without a database.
function buildProjectDefaults(siteConfig) {
  const defaults = { config: {}, emailConfig: {} };
  if (!siteConfig) return defaults;

  const globalConfig = siteConfig.config || {};
  const globalEmailConfig = siteConfig.emailConfig || {};

  INHERITED_STYLING_KEYS.forEach((key) => {
    if (globalConfig.styling?.[key]) {
      defaults.config.styling = defaults.config.styling || {};
      defaults.config.styling[key] = globalConfig.styling[key];
    }
  });

  INHERITED_NOTIFICATION_KEYS.forEach((key) => {
    if (globalEmailConfig.notifications?.[key]) {
      defaults.emailConfig.notifications =
        defaults.emailConfig.notifications || {};
      defaults.emailConfig.notifications[key] =
        globalEmailConfig.notifications[key];
    }
  });

  INHERITED_LOGIN_KEYS.forEach((key) => {
    if (globalEmailConfig.login?.[key]) {
      defaults.emailConfig.login = defaults.emailConfig.login || {};
      defaults.emailConfig.login[key] = globalEmailConfig.login[key];
    }
  });

  return defaults;
}

async function getGlobalProjectDefaults() {
  // Required lazily: a top level require opens a database connection at import time,
  // which makes this module unusable from a unit test.
  const db = require('../db');

  let siteConfig;
  try {
    siteConfig = await db.SiteConfig.findOne({ where: { id: 1 } });
  } catch (err) {
    console.log('Could not read global settings, skipping inheritance', err);
    return buildProjectDefaults(null);
  }

  return buildProjectDefaults(siteConfig);
}

// The one mail that cannot be inherited at send time. The auth server sends the login
// mail itself from its client config, and NotificationTemplate's updateAuthClient hook is
// what fills that config - a global row has no project to push to. So a new project gets
// the global login mail as its own row, after which the existing hook does the rest.
// The other types are resolved at send time, see notifications/resolve-template.js.
const LOGIN_TEMPLATE_TYPE = 'login email';

// Columns copied onto the project row. `type` is added separately, `projectId` by the
// caller, and id/timestamps must not carry over.
const COPIED_TEMPLATE_KEYS = ['engine', 'label', 'subject', 'body', 'content'];

// Pure half: what the project row looks like, or null when there is nothing to copy.
function buildLoginTemplateRow(globalTemplate, projectId) {
  if (!globalTemplate || !projectId) return null;

  const row = { projectId, type: LOGIN_TEMPLATE_TYPE };
  COPIED_TEMPLATE_KEYS.forEach((key) => {
    if (globalTemplate[key] !== undefined) row[key] = globalTemplate[key];
  });
  if (!row.body) return null;
  if (!row.label) row.label = LOGIN_TEMPLATE_TYPE;
  return row;
}

// Copies the global login mail onto a freshly created project. Skips silently when there
// is no global template, or when the project already has one: a duplicated project brings
// its source's templates along, and those must never be overwritten.
async function copyGlobalLoginTemplate(projectId, options = {}) {
  if (!projectId) return null;

  // Required lazily for the same reason as above: no database connection at import time.
  const db = options.db || require('../db');

  const globalTemplate = await db.SiteNotificationTemplate.findOne({
    where: { type: LOGIN_TEMPLATE_TYPE },
  });
  const row = buildLoginTemplateRow(globalTemplate, projectId);
  if (!row) return null;

  const existing = await db.NotificationTemplate.findOne({
    where: { projectId, type: LOGIN_TEMPLATE_TYPE },
  });
  if (existing) return null;

  return await db.NotificationTemplate.create(row);
}

module.exports = {
  LOGIN_TEMPLATE_TYPE,
  buildProjectDefaults,
  buildLoginTemplateRow,
  copyGlobalLoginTemplate,
  getGlobalProjectDefaults,
};
