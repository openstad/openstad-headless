const authSettings = require('../util/auth-settings');

async function findProjectsWithJwtSecretOverride(db) {
  const projects = await db.Project.findAll();

  return projects
    .filter((project) => authSettings.hasJwtSecretOverride(project))
    .map((project) => project.id);
}

async function assertNoJwtSecretOverrides(db) {
  const offending = await findProjectsWithJwtSecretOverride(db);

  if (offending.length === 0) return;

  throw new Error(
    `Project(s) ${offending.join(', ')} override config.auth.jwtSecret. ` +
      'Tokens are verified with the global secret, so per-project overrides break login. ' +
      'Remove the jwtSecret from these project configs before starting the server.'
  );
}

module.exports = {
  findProjectsWithJwtSecretOverride,
  assertNoJwtSecretOverrides,
};
