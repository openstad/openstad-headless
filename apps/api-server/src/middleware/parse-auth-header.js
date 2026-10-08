const jwt = require('jsonwebtoken');

function parseAuthHeader(authorizationHeader, { jwtSecret, fixedAuthTokens }) {
  if (authorizationHeader.match(/^bearer /i)) {
    const claims = parseJwt(authorizationHeader, jwtSecret);
    if (claims && claims.pending) {
      return {};
    }
    // The projectId claim is deliberately not enforced: the cross-project admin
    // fallback in user.js relies on tokens of another project
    return claims && claims.userId
      ? { userId: claims.userId, authProvider: claims.authProvider }
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

function parseJwt(authorizationHeader, jwtSecret) {
  let token = authorizationHeader.replace(/^bearer /i, '');
  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.error(
        `[${new Date().toISOString()}][auth-middleware] JWT expired: expiredAt=${err.expiredAt?.toISOString?.() || 'unknown'}`
      );
    } else {
      console.error(
        `[${new Date().toISOString()}][auth-middleware] JWT verification failed: ${err.name}: ${err.message}`
      );
    }
    throw err;
  }
}

module.exports = { parseAuthHeader, parseJwt };
