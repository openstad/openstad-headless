'use strict';

const privilegedRoles = ['admin', 'moderator', 'editor', 'superuser'];
const privilegedJwtExpiresInSeconds = 12 * 60 * 60;
const defaultJwtExpiresInSeconds = 7 * 24 * 60 * 60;

const getJwtExpiresInForRole = (role = '') => {
  return privilegedRoles.includes(role)
    ? privilegedJwtExpiresInSeconds
    : defaultJwtExpiresInSeconds;
};

module.exports = {
  getJwtExpiresInForRole,
};
