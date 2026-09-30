const defaultTemplatesCatalog = require('./default-templates-catalog');

/**
 * Which template a mail is rendered from, in order of precedence:
 *
 *   1. the project's own row  - the project edited this mail, so it always wins
 *   2. the global row         - set once on the global settings page
 *   3. the shipped file       - notifications/default-templates/<type>
 *
 * The project row sits on top on purpose: a global change must never overwrite a
 * mail a project already customised. Returns null when no level has a template.
 *
 * `db` is a parameter instead of a require so this runs in a unit test without a
 * database connection.
 */
async function resolveTemplate({ db, projectId, type }) {
  const projectTemplate = await db.NotificationTemplate.findOne({
    where: { projectId, type },
  });
  if (projectTemplate) return projectTemplate;

  // Guarded: an installation that has not run migration 118 yet has no model here,
  // and a missing global level must not stop the mail from being sent.
  if (db.SiteNotificationTemplate) {
    const globalTemplate = await db.SiteNotificationTemplate.findOne({
      where: { type },
    });
    if (globalTemplate) return globalTemplate;
  }

  return await defaultTemplatesCatalog.getDefaultTemplate(type);
}

module.exports = { resolveTemplate };
