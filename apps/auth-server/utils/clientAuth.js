'use strict';

const defaultRole = require('../config/roles').defaultRole;
const privilegedRoles = require('../config/roles').privilegedRoles;
const db = require('../db');

const PRIVILEGED_SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const DEFAULT_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getClientAuthKey = (client) => {
  if (!client || typeof client.id === 'undefined' || client.id === null) {
    throw new Error('Client auth context requires a client with an id');
  }

  return String(client.id);
};

const ensureClientAuthStore = (session) => {
  if (!session.clientAuth || typeof session.clientAuth !== 'object') {
    session.clientAuth = {};
  }

  return session.clientAuth;
};

const getClientAuth = (session, client) => {
  if (!session || !client) return null;

  const store = ensureClientAuthStore(session);
  return store[getClientAuthKey(client)] || null;
};

const setClientAuth = (session, client, data = {}) => {
  if (!session || !client) return null;

  const store = ensureClientAuthStore(session);
  const key = getClientAuthKey(client);
  const previous = store[key] || {};

  store[key] = {
    authenticatedAt: previous.authenticatedAt || Date.now(),
    role:
      typeof data.role !== 'undefined' && data.role !== null
        ? data.role
        : previous.role || defaultRole,
    authType:
      typeof data.authType !== 'undefined' ? data.authType : previous.authType,
    twoFactorValid:
      typeof data.twoFactorValid !== 'undefined'
        ? data.twoFactorValid
        : previous.twoFactorValid || false,
  };

  return store[key];
};

const clearClientAuth = (session, client) => {
  if (!session || !client || !session.clientAuth) return;

  delete session.clientAuth[getClientAuthKey(client)];
};

const getSessionMaxAgeMsForRole = (role = defaultRole) => {
  return privilegedRoles.includes(role)
    ? PRIVILEGED_SESSION_MAX_AGE_MS
    : DEFAULT_SESSION_MAX_AGE_MS;
};

const isClientAuthExpired = (context, role = defaultRole) => {
  if (!context?.authenticatedAt) return false;

  return Date.now() - context.authenticatedAt > getSessionMaxAgeMsForRole(role);
};

const resolveRoleForClient = async (user, client) => {
  if (!user || !client) return defaultRole;

  if (typeof user.getRoleForClient === 'function') {
    const role = await user.getRoleForClient(client.id);
    return role || defaultRole;
  }

  const userRole = await db.UserRole.findOne({
    where: {
      userId: user.id,
      clientId: client.id,
    },
  });

  if (!userRole) return defaultRole;

  const role = await db.Role.findOne({ where: { id: userRole.roleId } });
  return role?.name || defaultRole;
};

const initializeClientAuth = async (session, client, user, data = {}) => {
  const role =
    typeof data.role !== 'undefined'
      ? data.role
      : await resolveRoleForClient(user, client);

  return setClientAuth(session, client, {
    ...data,
    role,
  });
};

const saveSession = (session) => {
  if (!session || typeof session.save !== 'function') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    session.save((err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};

module.exports = {
  clearClientAuth,
  getClientAuth,
  getSessionMaxAgeMsForRole,
  initializeClientAuth,
  isClientAuthExpired,
  resolveRoleForClient,
  saveSession,
  setClientAuth,
};
