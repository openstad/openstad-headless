const db = require('../db');
const { privilegedRoles } = require('../config/roles');
const clientAuth = require('../utils/clientAuth');

const ADMIN_PANEL_CLIENT_ID = 1;

const queryStringOf = (req) => {
  const queryIndex = req.originalUrl.indexOf('?');
  return queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
};

module.exports = async function reuseSessionForAdminLogin(req, res, next) {
  try {
    if (process.env.MULTI_PROJECT_LOGIN !== 'true') return next();
    const hasSession =
      typeof req.isAuthenticated === 'function' && req.isAuthenticated();
    if (!hasSession || !req.query.client_id) return next();

    const client = await db.Client.findOne({
      where: { clientId: req.query.client_id },
    });
    if (!client || client.id === ADMIN_PANEL_CLIENT_ID) return next();

    const role = await clientAuth.resolveRoleForClient(req.user, client);
    if (!privilegedRoles.includes(role)) return next();

    clientAuth.setClientAuth(req.session, client, {
      role,
      twoFactorRequired: true,
    });
    await clientAuth.saveSession(req.session);
    return res.redirect('/dialog/authorize' + queryStringOf(req));
  } catch (err) {
    return next(err);
  }
};
