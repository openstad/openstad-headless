const shouldForceNewLoginByDefault = (project, env = process.env) =>
  project?.config?.auth?.forceNewLoginOnWidgets ??
  env.MULTI_PROJECT_LOGIN !== 'true';

module.exports = { shouldForceNewLoginByDefault };
