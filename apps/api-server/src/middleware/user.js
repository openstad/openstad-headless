const config = require('config');
const jwt = require('jsonwebtoken');
const merge = require('merge');
const db = require('../db');
const authSettings = require('../util/auth-settings');

let adapters = {};
const DEBUG_PATH_RE = /^\/api\/pending-budget-vote(\/|$)/;

function shouldDebugRequest(req) {
  return DEBUG_PATH_RE.test(req.path || '');
}

function shortToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') return 'none';
  const token = authorizationHeader.replace(/^bearer /i, '');
  if (token.length <= 12) return token;
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

/**
 * Get user from jwt or fixed token and validate with auth server
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
module.exports = async function getUser( req, res, next ) {

  try {
    const debug = shouldDebugRequest(req);
    if (debug) {
      console.log('[pending-vote-debug][user-mw] start', {
        method: req.method,
        path: req.path,
        hasAuthorization: !!req.headers['authorization'],
        tokenPreview: shortToken(req.headers['authorization']),
        origin: req.headers.origin,
        projectId: req.project && req.project.id,
      });
    }

    if (!req.headers['authorization']) {
      if (debug) console.log('[pending-vote-debug][user-mw] no authorization header, using empty user');
      return nextWithEmptyUser(req, res, next);
    } else {
      const allowedUploadPaths = [
        "/upload/images",
        "/upload/documents"
      ];

      const isUploadRequest = allowedUploadPaths.some(path => req.path.endsWith(path));

      if (isUploadRequest) {
        const payload = {
          userId: "9999999",
          authProvider: "upload-service",
          exp: Math.floor(Date.now() / 1000) + (5 * 60)
        };

        const uploadJwt = jwt.sign(payload, config.auth.jwtSecret);

        req.headers['authorization'] = `Bearer ${uploadJwt}`;
        if (debug) console.log('[pending-vote-debug][user-mw] upload request, injected temporary jwt');
      }
    }
    let { userId, isFixed, authProvider } = parseAuthHeader(req.headers['authorization']);
    if (debug) {
      console.log('[pending-vote-debug][user-mw] parsed auth header', {
        userId,
        isFixed: !!isFixed,
        authProvider: authProvider || 'none',
      });
    }
    let authConfig = await authSettings.config({ project: req.project, useAuth: authProvider })
    if (debug) {
      console.log('[pending-vote-debug][user-mw] resolved auth config', {
        provider: authConfig && authConfig.provider,
        adapter: authConfig && authConfig.adapter,
        hasProjectContext: !!req.project,
        projectId: req.project && req.project.id,
        clientId: authConfig && authConfig.clientId,
        serverUrlInternal: authConfig && authConfig.serverUrlInternal,
      });
    }

    if(userId === null || typeof userId === 'undefined') {
      if (debug) console.log('[pending-vote-debug][user-mw] no userId parsed, using empty user');
      return nextWithEmptyUser(req, res, next);
    }

    let projectId = req.project && req.project.id;

    const userEntity = await getUserInstance({ authConfig, authProvider, userId, isFixed, projectId }) || {};
    if (debug) {
      console.log('[pending-vote-debug][user-mw] getUserInstance result', {
        hasUserEntity: !!(userEntity && userEntity.id),
        userId: userEntity && userEntity.id,
        role: userEntity && userEntity.role,
      });
    }

    req.user = userEntity
    
    return next();
    
  } catch(error) {
    if (shouldDebugRequest(req)) {
      console.log('[pending-vote-debug][user-mw] error', {
        message: error && error.message,
        stackTop: error && error.stack && error.stack.split('\n')[0],
      });
    }
    console.error(error);
    next(error);
  }
}

/**
 * Continue with empty user if user is not set
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function nextWithEmptyUser(req, res, next) {
  req.user = {};
  return next();
}

function parseAuthHeader(authorizationHeader) {

  // todo: // config moet authConfig zijn
  const fixedAuthTokens = config && config.auth && config.auth['fixedAuthTokens'];

  if (authorizationHeader.match(/^bearer /i)) {
    const jwt = parseJwt(authorizationHeader);
    return (jwt && jwt.userId) ? { userId: jwt.userId, authProvider: jwt.authProvider } : {};
  }

  if (fixedAuthTokens) {
    const token = fixedAuthTokens.find(token => token.token === authorizationHeader);
    if (token) {
      return { userId: token.userId, isFixed: true, authProvider: token.authProvider }
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
  return jwt.verify(token, config.auth['jwtSecret']);
}

/**
 * Get user from api database and auth server and combine to one user object.
 * @param user
 * @param projectConfig
 * @returns {Promise<{}|*>}
 */
async function getUserInstance({ authConfig, authProvider, userId, isFixed, projectId }) {

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
            }, {
              projectId: projectId
            }
          ]});
      } else {
        where.projectId = config.admin.projectId;
        where.role = { [db.Sequelize.Op.in]: ['admin', 'editor'] };
      }
    }

    dbUser = await db.User.findOne({ where });

    if (isFixed) {
      if (!dbUser.projectId || dbUser.projectId == config.admin.projectId) dbUser.role = 'superuser'; // !dbUser.projectId is backwards compatibility
      return dbUser;
    }

    if (!dbUser || ( !dbUser.idpUser || !dbUser.idpUser.accesstoken ) ) {
      return dbUser;
    }

  } catch(err) {
    console.log(err);
    throw err;
  }

  if (dbUser.projectId != projectId && dbUser.projectId == config.admin.projectId ) {
    // admin op config.admin.projectId = superuser; use the correct authConfig
    let adminProject = await db.Project.findOne({ where: { id: config.admin.projectId } });
    authConfig = await authSettings.config({ project: adminProject, useAuth: 'default' });
  }

  let adapter = authConfig.adapter || 'openstad';
  try {
    if (!adapters[adapter]) {
      adapters[adapter] = await authSettings.adapter({ authConfig });
    }
  } catch(err) {
    console.log(err);
  }

  try {

    // get userdata from auth server
    let service = adapters[ adapter ].service;
    
    let userData = await service.fetchUserData({
      authConfig: authConfig,
      accessToken: dbUser.idpUser.accesstoken,
    })

    let mergedUser = merge(dbUser, userData);
    if (mergedUser.projectId == config.admin.projectId && mergedUser.role == 'admin') {
      // superusers mogen dingen over projecten heen, mindere goden alleen binnen hun eigen project
      mergedUser.role = 'superuser';
    }

    return mergedUser;
    
  } catch(err) {
    console.log('[pending-vote-debug][user-mw] auth-server fetch failed in getUserInstance', {
      message: err && err.message,
      userId,
      projectId,
      authProvider: authConfig && authConfig.provider,
      clientId: authConfig && authConfig.clientId,
      serverUrlInternal: authConfig && authConfig.serverUrlInternal,
    });
    console.log(err);
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
  if (!( user && user.update )) return {};
  let idpUser = { ...user.idpUser };
  delete idpUser.accesstoken;
  await user.update({
    idpUser,
  });
  return {};
}
