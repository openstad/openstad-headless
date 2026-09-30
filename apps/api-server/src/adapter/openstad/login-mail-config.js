// Reads emailConfig.login off an already loaded project, or undefined when it is not there.
// The emailConfig getter parses the raw column value, so on a project loaded with the
// default scope - which leaves the attribute out - it throws instead of returning
// undefined, and optional chaining never gets its turn.
function readLoadedLoginSection(project) {
  if (!project) return undefined;
  if (project.dataValues && project.dataValues.emailConfig === undefined) {
    return undefined;
  }
  try {
    return project.emailConfig?.login;
  } catch (err) {
    // The dataValues check above already covers the model instances we know of, so
    // reaching this means something else refuses to be read - worth a line.
    console.log(
      'Could not read the login e-mail settings off the project',
      err
    );
    return undefined;
  }
}

// Maps a login section to the fromEmail/fromName/contactEmail the auth client expects,
// leaving out every value that is not filled in.
function toClientConfig(login) {
  if (!login) return {};
  let clientConfig = {};
  if (login.fromAddress) clientConfig.fromEmail = login.fromAddress;
  if (login.fromName) clientConfig.fromName = login.fromName;
  if (login.helpAddress) clientConfig.contactEmail = login.helpAddress;
  return clientConfig;
}

function hasLoginValue(login) {
  return !!(
    login &&
    (login.fromAddress || login.fromName || login.helpAddress)
  );
}

module.exports = { hasLoginValue, readLoadedLoginSection, toClientConfig };
