'use strict';

/**
 * Properties and settings of the OAuth2 authorization server for defaults
 */
module.exports = {
  username      : 'stijnvandervegt@gmail.com',
  password      : 'secret',
  hostname      : 'https://localhost:4000',
  login         : 'https://localhost:4000/login',
  redirect      : '/',
  clientId      : 'e7f4fb5a3cf5ab1fe02253cdbcb47743',
  clientSecret  : '559fc2cdeba1e77d85af32f707d97201',
  token         : '/oauth/token',
  tokenInfo     : 'https://localhost:4000/api/tokeninfo',
  authorization : '/dialog/authorize',
  userinfo      : 'https://localhost:4000/api/userinfo',
  revokeToken   : 'https://localhost:4000/api/revoke',
  clientinfo    : 'https://localhost:4000/api/clientinfo',
  logout        : '/logout',
};
