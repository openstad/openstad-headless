const Client = require('../models').Client;
const authTypesConfig = require('../config').authTypes;

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
  console.log('req.body.clientIdreq.body.clientIdreq.body.clientId', req.body.clientId);
  console.log('req.body', req.body);

  const clientId = req.body.clientId ? req.body.clientId : req.query.clientId;

  if (clientId) {
    new Client({ clientId: clientId })
    .fetch()
    .then((client) => {
      if (client) {
        req.clientModel = client;
        req.client = client.serialize();
        next();
      } else {
        throw new Error('No Client found for clientID');
      }
    })
    .catch((err) => { next(err); });
  } else {
    throw new Error('No Client ID is set for login',);
/*
    next({
      name: 'ClientNotFoundError',
      status: 404,
      message:
    });
*/
  }
}


exports.withOneById = (req, res, next) => {
  const clientId = req.params.clientId;

  console.log('====> clientId', clientId);

  if (clientId) {
    new Client({ id: clientId })
    .fetch()
    .then((client) => {
      if (client) {
        req.clientModel = client;
        req.client = client.serialize();
        next();
      } else {
        throw new Error('No Client found for clientID');
      }
    })
    .catch((err) => { next(err); });
  } else {
    throw new Error('No Client ID is set for login',);
/*
    next({
      name: 'ClientNotFoundError',
      status: 404,
      message:
    });
*/
  }
}

/**
 * Add the login option
 */
exports.setAuthType = (authType) => {
  return (req, res, next) => {
    req.authType = authType;
    next();
  }
}

exports.validate = (req, res, next) => {
  let authTypes = req.clientModel.getAuthTypes(req.clientModel);
  const allowedType = authTypes && authTypes.length > 0 ? authTypes.find(option => option.key === req.authType) : false;

  /**
   * Check if any login options are defined for the client, otherwise error!
   */
  if (!authTypes) {
    throw new Error('No auth types selected');
  }

  /**
   * Check if auth type is allowed for client
   */
  if (!allowedType) {
    throw new Error('Auth types not allowed');

  }

  next();
}
