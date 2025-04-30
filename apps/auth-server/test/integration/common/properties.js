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
  clientId      : '',
  clientSecret  : '',
  token         : '/oauth/token',
  tokenInfo     : 'https://localhost:4000/api/tokeninfo',
  authorization : '/dialog/authorize',
  userinfo      : 'https://localhost:4000/api/userinfo',
  revokeToken   : 'https://localhost:4000/api/revoke',
  clientinfo    : 'https://localhost:4000/api/clientinfo',
  logout        : '/logout',
};
