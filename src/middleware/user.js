const config = require('config');
const jwt = require('jsonwebtoken');
const merge = require('merge');
const fetch = require('node-fetch');
const db = require('../db');
const OAuthApi = require('../services/oauth-api');

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

    let siteConfig = req.site && merge({}, req.site.config, { id: req.site.id });

    let { userId, isFixed, authProvider } = parseAuthHeader(req.headers['x-authorization']);
    authProvider = authProvider || req.query.useAuth || req.query.useOauth || siteConfig.auth.default; // todo: req.query.useOauth is wegens backwards compatible en moet er uiteindelijk uit
    let authConfig = (siteConfig && siteConfig.auth && siteConfig.auth.providers && siteConfig.auth.providers[authProvider] ) || {};
    
    if(userId === null || typeof userId === 'undefined') {
      return nextWithEmptyUser(req, res, next);
    }

    // TODO: params {siteConfig, authProvider} moet {authConfig} worden
    const userEntity = await getUserInstance({ siteConfig: { [authProvider]: authConfig }, authProvider, userId, isFixed, siteId: ( req.site && req.site.id ) }) || {};

    req.user = userEntity
    // Pass user entity to template view.
    res.locals.user = userEntity;
    
    next();
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
async function getUserInstance({ siteConfig, authProvider, userId, isFixed, siteId }) {

  let dbUser;
  
  try {

    let where = { id: userId };
    if (siteId && !isFixed) where.siteId = siteId;

    dbUser = await db.User.findOne({ where });

    if (isFixed) {
      return dbUser;
    }

    // extradata is tmp want moet in provider
    if (!dbUser || ( !dbUser.extraData.oidc && ( !dbUser.idpUser || !dbUser.idpUser.accesstoken ) ) ) {
      return {};
    }

  } catch(err) {
    console.log(err);
    throw err;
  }

  try {

    if (dbUser.extraData.oidc) {

      // todo: dit moet plugin worden
      // check oidc login
      let url = `${dbUser.extraData.oidc.iss}/oidc/me`;
      let access_token = dbUser.extraData.oidc.access_token;
      let response = await fetch(url, {
        headers: { "Authorization": `Bearer ${access_token}` },
        method: 'GET'
      });
      if (!response.ok) {
        console.log(response);
        throw new Error('Fetch oidc user failed')
      }
      let oidcUser = await response.json();

      if (!oidcUser) {
        return {};
      }

      let mergedUser = merge(dbUser, oidcUser);
      mergedUser.role = ((mergedUser.email || mergedUser.phoneNumber || mergedUser.hashedPhoneNumber) ? 'member' : 'anonymous'); // mergedUser.role || ((mergedUser.email || mergedUser.phoneNumber || mergedUser.hashedPhoneNumber) ? 'member' : 'anonymous');
      
      return mergedUser;

    } else {
      let oauthUser;
      let authUrl = siteConfig.oauth && siteConfig.oauth.default && siteConfig.oauth.default['auth-server-url'];
      
      if ( authUrl ==  'https://api.snipper.nlsvgtr.nl') { // snipper app van niels
        oauthUser = {};
      } else {
        oauthUser = await OAuthApi.fetchUser({ siteConfig, authProvider, token: dbUser.idpUser.accesstoken });
        if (!oauthUser) return await resetUserToken(dbUser);
      }

      let mergedUser = merge(dbUser, oauthUser);
      mergedUser.role = mergedUser.role || ((mergedUser.email || mergedUser.phoneNumber || mergedUser.hashedPhoneNumber) ? 'member' : 'anonymous');
      return mergedUser;

    }
    
  } catch(error) {
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
  let idpUser = user.idpUser;
  delete idpUser.accesstoken;
  await user.update({
    idpUser
  });

  return {};
}
