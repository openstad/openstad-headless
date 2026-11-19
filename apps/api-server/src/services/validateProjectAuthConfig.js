const authSettings = require('../util/auth-settings');

async function findProjectsWithJwtSecretOverride(db) {
  const projects = await db.Project.findAll();

  return projects
    .filter((project) => authSettings.hasJwtSecretOverride(project))
    .map((project) => project.id);
}

async function warnAboutJwtSecretOverrides(db, log = console.error) {
  const offending = await findProjectsWithJwtSecretOverride(db);

  if (offending.length === 0) return;

  log(
    `[auth-settings] Project(s) ${offending.join(', ')} override config.auth.jwtSecret. ` +
      'Tokens are verified with the global secret, so logins for these projects fail. ' +
      'Remove the jwtSecret from these project configs.'
  );
}

module.exports = {
  findProjectsWithJwtSecretOverride,
  warnAboutJwtSecretOverrides,
};
