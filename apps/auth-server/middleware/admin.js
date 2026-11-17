const adminClientId = process.env.ADMIN_CLIENT_ID;
const db = require('../db');

exports.ensure = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    throw new Error('Forbidden');
  }
};

/**
 * The admin client is seeded with id 1 and clientId AUTH_ADMIN_CLIENT_ID.
 * Fails closed: without a match the client is treated as a regular project client.
 */
const isAdminClient = (client) => {
  if (!client) return false;
  if (String(client.id) === '1') return true;
  const envClientId = process.env.AUTH_ADMIN_CLIENT_ID;
  return !!envClientId && client.clientId === envClientId;
};
exports.isAdminClient = isAdminClient;

const forbidden = () => {
  const err = new Error('Forbidden');
  err.status = 403;
  return err;
};

// Admin API: the client resolved from the request (req.client) must be the
// authenticated client (req.user), unless the caller is the admin client.
exports.ensureOwnClient = (req, res, next) => {
  if (isAdminClient(req.user)) return next();
  if (req.user && req.client && req.client.id === req.user.id) return next();
  return next(forbidden());
};

exports.ensureAdminClient = (req, res, next) => {
  if (isAdminClient(req.user)) return next();
  return next(forbidden());
};

exports.addClient = (req, res, next) => {
  db.Client.findOne({ where: { id: adminClientId } })
    .then((client) => {
      req.client = client;
      res.locals.client = req.client;
      next();
    })
    .catch((err) => {
      next(err);
    });
};
