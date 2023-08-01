const config = require('config');
const jwt = require('jsonwebtoken');
const merge = require('merge');
const fetch = require('node-fetch');
const db = require('../db');
const authconfig = require('../util/auth-config');

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

    if (!req.headers['x-authorization']) {
      return nextWithEmptyUser(req, res, next);
    }

    let { userId, isFixed, authProvider } = parseAuthHeader(req.headers['x-authorization']);
    let authConfig = await authconfig({ site: req.site, useAuth: authProvider })
    
    if(userId === null || typeof userId === 'undefined') {
      return nextWithEmptyUser(req, res, next);
    }

    const userEntity = await getUserInstance({ authConfig, userId, isFixed, siteId: ( req.site && req.site.id ) }) || {};

    req.user = userEntity
    if (req.user.id) req.user.provider = authConfig.provider
    
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
    return (jwt && jwt.userId) ? { userId: jwt.userId, authProvider: jwt.authProvider } : null;
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
 * @param siteConfig
 * @returns {Promise<{}|*>}
 */
async function getUserInstance({ authConfig, userId, isFixed, siteId }) {

  let dbUser;
  
  try {

    let where = { id: userId };
    if (siteId && !isFixed) where.siteId = siteId;
    if (!isFixed) where.idpUser = { provider: authConfig.provider };

    dbUser = await db.User.findOne({ where });

    if (isFixed) {
      return dbUser;
    }

    // extradata is tmp want moet in provider
    if (!dbUser || ( !dbUser.idpUser || !dbUser.idpUser.accesstoken ) ) {
      return {};
    }

  } catch(err) {
    console.log(err);
    throw err;
  }

  let adapter = authConfig.adapter || 'openstad';

  try {
    if (!adapters[adapter]) {
      adapters[adapter] = await require(process.env.NODE_PATH + '/' + authConfig.modulePath);
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
    return mergedUser;
    
  } catch(error) {
    console.log(error);
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
