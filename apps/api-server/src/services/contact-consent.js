const db = require('../db');

const CONSENT_FIELD = 'emailNotificationConsent';

function requiresContactConsent(project) {
  const requiredFields =
    project?.config?.auth?.provider?.openstad?.requiredUserFields;
  return (
    Array.isArray(requiredFields) && requiredFields.includes(CONSENT_FIELD)
  );
}

async function ownerAllowsContact(project, resource) {
  if (!requiresContactConsent(project)) return true;
  if (!resource?.userId) return false;
  const owner = await db.User.findByPk(resource.userId);
  return owner?.[CONSENT_FIELD] === true;
}

async function consentingUserIds(project) {
  const users = await db.User.findAll({
    where: { projectId: project.id, [CONSENT_FIELD]: true },
    attributes: ['id'],
  });
  return users.map((user) => user.id);
}

module.exports = {
  CONSENT_FIELD,
  consentingUserIds,
  ownerAllowsContact,
  requiresContactConsent,
};
