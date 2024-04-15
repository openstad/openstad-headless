const config = require('config');
const jwt = require('jsonwebtoken');
const merge = require('merge');
const fetch = require('node-fetch');
const db = require('../db');
const authSettings = require('../util/auth-settings');

let adapters = {};

/**
 * Get user from jwt or fixed token and validate with auth server
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
module.exports = async function getUser( req, res, next ) {

  try {

    if (!req.headers['authorization']) {
      return nextWithEmptyUser(req, res, next);
    }

    let { userId, isFixed, authProvider } = parseAuthHeader(req.headers['authorization']);
    let authConfig = await authSettings.config({ project: req.project, useAuth: authProvider })
    
    if(userId === null || typeof userId === 'undefined') {
      return nextWithEmptyUser(req, res, next);
    }

    let projectId = req.project && req.project.id;

    const userEntity = await getUserInstance({ authConfig, authProvider, userId, isFixed, projectId }) || {};

    req.user = userEntity
    
    return next();
    
  } catch(error) {
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
        where.role = 'admin';
      }
    }

    dbUser = await db.User.findOne({ where });

    if (isFixed) {
      if (!dbUser.projectId || dbUser.projectId == config.admin.projectId) dbUser.role = 'superuser'; // !dbUser.projectId is backwards compatibility
      return dbUser;
    }

    if (!dbUser || ( !dbUser.idpUser || !dbUser.idpUser.accesstoken ) ) {
      return {};
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
