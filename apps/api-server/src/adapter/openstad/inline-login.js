const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const sessionDuration = require('../../util/session-duration');

const privilegedRoles = ['admin', 'moderator', 'editor'];
const defaultRole = 'member';
const pendingJwtExpiresInSeconds = 15 * 60;

const hasClientConsent = (value, clientId) =>
  !!value &&
  typeof value === 'object' &&
  Object.prototype.hasOwnProperty.call(value, String(clientId));

const findMissingFields = ({ client, user }) =>
  (client.requiredUserFields || []).filter((field) => {
    if (field === 'emailNotificationConsent') {
      return !hasClientConsent(user.emailNotificationConsent, client.id);
    }
    if (field === 'privacyConsent') {
      return !hasClientConsent(user.privacyConsentAt, client.id);
    }
    return !user[field];
  });

const evaluateClientGates = ({
  client,
  user,
  role,
  projectId,
  hasUniqueCode,
}) => {
  const clientRole = role || defaultRole;
  const isPrivileged = privilegedRoles.includes(clientRole);
  const authTypes = client.authTypes || [];

  if (Number(projectId) === 1 && !isPrivileged) {
    return { ok: false, status: 'environment_forbidden' };
  }
  if ((client.twoFactorRoles || []).includes(clientRole)) {
    return { ok: false, status: 'two_factor_required' };
  }
  if (
    authTypes.includes('Phonenumber') &&
    !user.phoneNumberConfirmed &&
    !isPrivileged
  ) {
    return { ok: false, status: 'phonenumber_required' };
  }
  if (
    authTypes.length === 1 &&
    authTypes[0] === 'UniqueCode' &&
    !hasUniqueCode &&
    !isPrivileged
  ) {
    return { ok: false, status: 'uniquecode_required' };
  }

  const missingFields = findMissingFields({ client, user });
  if (missingFields.length > 0) {
    return { ok: false, status: 'fields_required', missingFields };
  }

  return { ok: true };
};

const mintJwt = ({ authConfig, userId, role, projectId, pending = false }) => {
  const payload = { userId, authProvider: authConfig.provider, projectId };
  if (pending) payload.pending = true;

  const expiresIn = pending
    ? pendingJwtExpiresInSeconds
    : sessionDuration.getJwtExpiresInForRole(role);

  return new Promise((resolve, reject) => {
    jwt.sign(payload, authConfig.jwtSecret, { expiresIn }, (err, token) =>
      err ? reject(err) : resolve(token)
    );
  });
};

// Digest login keeps swallowing update errors (existing behaviour); the inline
// path throws so a half-filled project user never gets a final jwt
const upsertProjectUser = async ({
  User,
  project,
  userData,
  throwOnUpdateError = false,
}) => {
  const users = await User.findAll({
    where: Sequelize.and(
      {
        idpUser: {
          identifier: userData.idpUser.identifier,
          provider: userData.idpUser.provider,
        },
      },
      { projectId: userData.projectId }
    ),
  });

  if (users.length > 1) {
    throw createError(403, 'Meerdere users gevonden');
  }

  if (users.length === 1) {
    const user = users[0];
    try {
      await user.update(userData);
      console.log(
        `[${new Date().toISOString()}][digest-login] user found and updated: userId=${user.id} projectId=${project?.id}`
      );
    } catch (e) {
      console.log(
        `[${new Date().toISOString()}][digest-login] user update failed: userId=${user.id} projectId=${project?.id} error=${e?.message}`
      );
      if (throwOnUpdateError) throw e;
    }
    return user.id;
  }

  if (!project.config.users.canCreateNewUsers) {
    throw createError(
      403,
      'Users mogen niet aangemaakt worden op deze project'
    );
  }

  try {
    const created = await User.create({ ...userData, complete: true });
    console.log(
      `[${new Date().toISOString()}][digest-login] user created: userId=${created.id} projectId=${project?.id} role=${created.role}`
    );
    return created.id;
  } catch (err) {
    console.log(
      `[${new Date().toISOString()}][digest-login] user create failed: projectId=${project?.id} error=${err?.message}`
    );
    throw err;
  }
};

const clientConsentFields = ['emailNotificationConsent', 'privacyConsentAt'];

const applyClientConsents = (userData) => {
  const result = { ...userData };
  if (!result.clientId) return result;

  const clientKey = String(result.clientId);
  clientConsentFields.forEach((field) => {
    if (!result[field]) return;
    const current = typeof result[field] === 'object' ? result[field] : {};
    if (Object.prototype.hasOwnProperty.call(current, clientKey)) {
      result[field] = current[clientKey];
    } else {
      delete result[field];
    }
  });
  return result;
};

const resolveTargetRole = ({ rawUser, clientId }) => {
  const hasRoleForClient = (rawUser.roles || []).some(
    (userRole) => String(userRole.clientId) === String(clientId)
  );
  return hasRoleForClient ? rawUser.role : defaultRole;
};

const pickAllowedFields = ({ fields, missingFields }) =>
  missingFields.reduce((allowed, field) => {
    if (!Object.prototype.hasOwnProperty.call(fields, field)) return allowed;
    if (field === 'privacyConsent') {
      if (fields.privacyConsent === true) allowed.privacyConsent = true;
      return allowed;
    }
    if (field === 'emailNotificationConsent') {
      allowed.emailNotificationConsent =
        fields.emailNotificationConsent === true;
      return allowed;
    }
    if (typeof fields[field] === 'string' && fields[field].trim()) {
      allowed[field] = fields[field].trim();
    }
    return allowed;
  }, {});

const fieldLabelsFor = (client) => {
  const labels = client.config?.requiredFields?.requiredUserFieldsLabels || {};
  return Object.fromEntries(
    Object.entries(labels).filter(
      ([, label]) => typeof label === 'string' && label.trim()
    )
  );
};

const privacyLinkFor = (client) => {
  let url;
  try {
    url = new URL(
      client.clientDisclaimerUrl || client.config?.clientDisclaimerUrl || ''
    );
  } catch (err) {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const text =
    client.clientDisclaimerText ||
    client.config?.clientDisclaimerText ||
    'privacyverklaring';
  return { url: url.href, text: text.charAt(0).toLowerCase() + text.slice(1) };
};

// Checks submitted fields against the api User model, so the project user
// update after login cannot fail on them
const findInvalidFields = async ({ User, fields }) => {
  const keys = Object.keys(fields).filter((key) => User.rawAttributes[key]);
  if (keys.length === 0) return [];
  const values = Object.fromEntries(keys.map((key) => [key, fields[key]]));
  try {
    await User.build(values).validate({ fields: keys, hooks: false });
    return [];
  } catch (err) {
    if (!Array.isArray(err.errors)) throw err;
    return [...new Set(err.errors.map((error) => error.path))];
  }
};

// Shared devices: a UniqueCode-only client must not silently reuse the
// auth-server session of the previous voter
const shouldForceNewLogin = async ({ query, project, fetchClient }) => {
  if (query.forceNewLogin) return true;
  if (process.env.MULTI_PROJECT_LOGIN !== 'true') return false;
  // newLoginDone marks the return from the forced logout
  if (query.newLoginDone) return false;
  if (project?.config?.auth?.forceNewLoginOnWidgets !== undefined) return false;
  try {
    const authTypes = (await fetchClient()).authTypes || [];
    return authTypes.length === 1 && authTypes[0] === 'UniqueCode';
  } catch (err) {
    return false;
  }
};

module.exports = {
  applyClientConsents,
  evaluateClientGates,
  fieldLabelsFor,
  findInvalidFields,
  mintJwt,
  pickAllowedFields,
  privacyLinkFor,
  resolveTargetRole,
  shouldForceNewLogin,
  upsertProjectUser,
};
