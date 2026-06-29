const config = require('config');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const merge = require('merge');
const db = require('../db');
const authSettings = require('../util/auth-settings');
const auditLogService = require('../services/audit-log');
const { isExpired } = require('../lib/api-token-status');

let adapters = {};

/**
 * Get user from jwt or fixed token and validate with auth server
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
module.exports = async function getUser(req, res, next) {
  try {
    if (!req.headers['authorization']) {
      return nextWithEmptyUser(req, res, next);
    }

    // Opaque API token path (Bearer osr_…) — bypasses JWT and auth-server round-trip
    if (/^bearer osr_/i.test(req.headers['authorization'])) {
      return handleApiToken(req, res, next);
    }

    const allowedUploadPaths = ['/upload/images', '/upload/documents'];

    const isUploadRequest = allowedUploadPaths.some((path) =>
      req.path.endsWith(path)
    );

    if (isUploadRequest) {
      const payload = {
        userId: '9999999',
        authProvider: 'upload-service',
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
      };

      const uploadJwt = jwt.sign(payload, config.auth.jwtSecret);

      req.headers['authorization'] = `Bearer ${uploadJwt}`;
    }

    let { userId, isFixed, authProvider } = parseAuthHeader(
      req.headers['authorization']
    );
    let authConfig = await authSettings.config({
      project: req.project,
      useAuth: authProvider,
    });

    if (userId === null || typeof userId === 'undefined') {
      return nextWithEmptyUser(req, res, next);
    }

    let projectId = req.project && req.project.id;

    const userEntity =
      (await getUserInstance({
        authConfig,
        authProvider,
        userId,
        isFixed,
        projectId,
      })) || {};

    req.user = userEntity;

    return next();
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}][auth-middleware] getUser error: ${error?.message}`
    );
    next(error);
  }
};

/**
 * Authenticate using an opaque API token (osr_…) stored hashed in api_tokens.
 * Skips the auth-server round-trip; loads the owner User directly from DB.
 */
async function handleApiToken(req, res, next) {
  try {
    const rawToken = req.headers['authorization'].replace(/^bearer /i, '');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const apiToken = await db.ApiToken.findOne({ where: { tokenHash } });

    // A null expiresAt means the token never expires; only treat a token as
    // expired when it has an expiry date that is in the past (shared helper).
    if (!apiToken || isExpired(apiToken)) {
      if (apiToken) {
        // Token exists but is expired: audit the first rejected use
        logExpiredTokenUse(req, apiToken).catch(() => {});
      }
      return nextWithEmptyUser(req, res, next);
    }

    const owner = await db.User.findOne({ where: { id: apiToken.userId } });
    if (!owner) {
      return nextWithEmptyUser(req, res, next);
    }

    // Enforce the token's project binding: stats routes check role only
    // (hasRole(req.user, 'editor')), so without this check a token from one
    // project could read another project's stats. Only superusers (admin on
    // the admin project) may cross project boundaries, mirroring the JWT path.
    const isSuperUser =
      owner.projectId == config.admin.projectId &&
      ['admin', 'superuser'].includes(owner.role);
    if (
      !isSuperUser &&
      (!req.project || req.project.id != apiToken.projectId)
    ) {
      return nextWithEmptyUser(req, res, next);
    }

    req.user = owner;
    req.apiTokenScope = 'reports';
    // Expose the token identity so the scope guard can attribute blocked-path
    // audit entries to the right token/project.
    req.apiTokenId = apiToken.id;
    req.apiTokenProjectId = apiToken.projectId;

    // Update lastUsedAt asynchronously — do not block the request
    apiToken.update({ lastUsedAt: new Date() }).catch(() => {});

    return next();
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}][auth-middleware] handleApiToken error: ${err?.message}`
    );
    return nextWithEmptyUser(req, res, next);
  }
}

/**
 * Write a single 'token_expired' audit entry the first time an expired token
 * is used. Expiry itself is passive (no event fires when a token expires), so
 * the first rejected use is the auditable moment. Later uses are not logged
 * again to avoid noise from external tools that keep polling with a dead token.
 */
async function logExpiredTokenUse(req, apiToken) {
  const existing = await db.AuditLog.findOne({
    where: {
      modelName: 'api-token',
      modelId: apiToken.id,
      action: 'token_expired',
    },
  });
  if (existing) return;

  const entry = auditLogService.buildEntry(req, {
    action: 'token_expired',
    modelName: 'api-token',
    modelId: apiToken.id,
    source: 'api',
    statusCode: 401,
  });
  // req.params is not populated at middleware level; take it from the token
  entry.projectId = apiToken.projectId;
  auditLogService.logDirect(entry);
}

/**
 * Continue with empty user if user is not set
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function nextWithEmptyUser(req, res, next) {
  req.user = { role: 'anonymous', id: null };
  return next();
}

function parseAuthHeader(authorizationHeader) {
  // todo: // config moet authConfig zijn
  const fixedAuthTokens =
    config && config.auth && config.auth['fixedAuthTokens'];

  if (authorizationHeader.match(/^bearer /i)) {
    const jwt = parseJwt(authorizationHeader);
    return jwt && jwt.userId
      ? { userId: jwt.userId, authProvider: jwt.authProvider }
      : {};
  }

  if (fixedAuthTokens) {
    const token = fixedAuthTokens.find(
      (token) => token.token === authorizationHeader
    );
    if (token) {
      return {
        userId: token.userId,
        isFixed: true,
        authProvider: token.authProvider,
      };
    }
  }

  return {};
}

/**
 * get token from authorization header and parse jwt.
 * @param authorizationHeader
 * @returns {*}
 */
function parseJwt(authorizationHeader) {
  let token = authorizationHeader.replace(/^bearer /i, '');
  try {
    return jwt.verify(token, config.auth['jwtSecret']);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log(
        `[${new Date().toISOString()}][auth-middleware] JWT expired: expiredAt=${err.expiredAt?.toISOString?.() || 'unknown'}`
      );
    } else {
      console.log(
        `[${new Date().toISOString()}][auth-middleware] JWT verification failed: ${err.name}: ${err.message}`
      );
    }
    throw err;
  }
}

/**
 * Get user from api database and auth server and combine to one user object.
 * @param user
 * @param projectConfig
 * @returns {Promise<{}|*>}
 */
async function getUserInstance({
  authConfig,
  authProvider,
  userId,
  isFixed,
  projectId,
}) {
  let dbUser;

  try {
    let where = { id: userId };

    if (!isFixed) {
      if (projectId) {
        where = Object.assign(where, {
          [db.Sequelize.Op.or]: [
            {
              role: 'admin',
              projectId: config.admin.projectId,
            },
            {
              projectId: projectId,
            },
          ],
        });
      } else {
        where.projectId = config.admin.projectId;
        where.role = { [db.Sequelize.Op.in]: ['admin', 'editor'] };
      }
    }

    dbUser = await db.User.findOne({ where });

    if (!dbUser && !isFixed && projectId) {
      let adminUser = await db.User.findOne({
        where: { id: userId, projectId: config.admin.projectId },
      });
      if (
        adminUser &&
        adminUser.idpUser &&
        adminUser.idpUser.identifier &&
        adminUser.idpUser.provider
      ) {
        dbUser = await db.User.findOne({
          where: {
            idpUser: {
              identifier: adminUser.idpUser.identifier,
              provider: adminUser.idpUser.provider,
            },
            projectId: projectId,
          },
          order: [['id', 'ASC']],
        });
      }
    }

    if (isFixed) {
      if (!dbUser.projectId || dbUser.projectId == config.admin.projectId)
        dbUser.role = 'superuser'; // !dbUser.projectId is backwards compatibility
      return dbUser;
    }

    if (!dbUser || !dbUser.idpUser || !dbUser.idpUser.accesstoken) {
      return dbUser;
    }
  } catch (err) {
    console.log(
      `[${new Date().toISOString()}][auth-middleware] getUserInstance error: userId=${userId} projectId=${projectId} error=${err?.message}`
    );
    throw err;
  }

  if (
    dbUser.projectId != projectId &&
    dbUser.projectId == config.admin.projectId
  ) {
    // admin op config.admin.projectId = superuser; use the correct authConfig
    let adminProject = await db.Project.findOne({
      where: { id: config.admin.projectId },
    });
    authConfig = await authSettings.config({
      project: adminProject,
      useAuth: 'default',
    });
  }

  let adapter = authConfig.adapter || 'openstad';
  try {
    if (!adapters[adapter]) {
      adapters[adapter] = await authSettings.adapter({ authConfig });
    }
  } catch (err) {
    console.log(
      `[${new Date().toISOString()}][auth-middleware] adapter init failed: adapter=${authConfig?.adapter || 'unknown'} error=${err?.message}`
    );
  }

  try {
    let service = adapters[adapter].service;

    let userData = await service.fetchUserData({
      authConfig: authConfig,
      accessToken: dbUser.idpUser.accesstoken,
    });

    let mergedUser = merge(dbUser, userData);
    if (
      mergedUser.projectId == config.admin.projectId &&
      mergedUser.role == 'admin'
    ) {
      // superusers mogen dingen over projecten heen, mindere goden alleen binnen hun eigen project
      mergedUser.role = 'superuser';
    }

    return mergedUser;
  } catch (err) {
    if (err?.message === 'Auth server rejected access token') {
      console.log(
        `[auth-sync] resetting stale access token for userId=${dbUser?.id || 'unknown'} projectId=${dbUser?.projectId || 'unknown'}`
      );
    } else {
      console.log(
        `[${new Date().toISOString()}][auth-middleware] auth server fetch failed: userId=${dbUser?.id || 'unknown'} error=${err?.message}`
      );
    }
    return await resetUserToken(dbUser);
  }
}

/**
 * Resets external access token in the api database if user exists.
 * This token is used to authorize with the auth server
 * @param user
 * @returns {Promise<{}>}
 */
async function resetUserToken(user) {
  if (!(user && user.update)) return {};
  let idpUser = { ...user.idpUser };
  delete idpUser.accesstoken;
  await user.update({
    idpUser,
  });
  return user;
}
