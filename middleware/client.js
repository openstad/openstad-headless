const Client = require('../../models').Client;
const authTypesConfig = require('../../config').authTypes;

exports.withAll = (req, res, next) => {
  Client
  .fetchAll()
  .then((clients) => {
     req.clientsCollection = clients;
     req.clients = clients.serialize();
     next();
  })
  .catch((err) => { next(err); });
}

exports.withOne = (req, res, next) => {
  const clientId = req.body.clientId ? req.body.clientId : req.query.clientId;

  if (clientId) {
    new Client({ clientId: clientId })
    .fetch()
    .then((client) => {
      req.clientModel = client;
      req.client = client.serialize();
      next();
    })
    .catch((err) => { next(err); });
  } else {
    next({
      status: 500,
      msg: 'No clientID found'
    });

  }
}

/**
 * Add the login option
 */
exports.setAuthType(authType) => {
  return (req, res, next) => {
    req.authType = authType;
    next();
  }
}

exports.validate = (req, res, next) => {
  let authTypes = req.client.authTypes;
  const allowedType = authTypes && authTypes.length > 0 ? authTypes.find(option => option.key === req.authType) : false;

  /**
   * Check if any login options are defined for the client, otherwise error!
   */
  if (!authTypes) {
    next({
      name: 'BadClientError',
      status: 403,
      message: 'No auth types were configured for client."
    });
  }

  /**
   * Check if auth type is allowed for client
   */
  if (!allowedType) {
    next({
      name: 'BadClientError',
      status: 403,
      message: 'Chosen auth type is not allowed for client."
    });
  }

  next();
}
