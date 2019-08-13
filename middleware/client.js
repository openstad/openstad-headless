const Client = require('../models').Client;
const UniqueCode = require('../models').UniqueCode;
const hat = require('hat');
const userFields = require('../config/user').fields;
const authTypes = require('../config/auth').types;

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
  let clientId = req.body && req.body.clientId ? req.body.clientId : req.query.clientId;

  if (!clientId) {
    clientId = req.query.client_id;
  }

  if (!clientId) {
    clientId = req.params.clientId;
  }

  if (clientId) {
    new Client({ clientId: clientId })
    .fetch()
    .then((client) => {
      if (client) {
        req.clientModel = client;
        req.client = client.serialize();

        const clientConfig = JSON.parse(req.client.config);
        res.locals.clientProjectUrl = clientConfig.projectUrl;
        res.locals.clientEmail = clientConfig.contactEmail;
        res.locals.clientDisclaimerUrl = clientConfig.clientDisclaimerUrl;


        req.client.authTypes            = JSON.parse(req.client.authTypes);
        req.client.exposedUserFields    = JSON.parse(req.client.exposedUserFields);
        req.client.requiredUserFields   = JSON.parse(req.client.requiredUserFields);
        req.client.config               = JSON.parse(req.client.config);
        req.client.allowedDomains       = JSON.parse(req.client.allowedDomains);

        next();
      } else {
        throw new Error('No Client found for clientID');
      }
    })
    .catch((err) => { next(err); });
  } else {
    throw new Error('No Client ID is set for login');
  }
}


exports.withOneById = (req, res, next) => {
  const clientId = req.params.clientId;

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
    throw new Error('No Client ID is set for login');
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

exports.checkUniqueCodeAuth = (errorCallback) => {
  //validate code auth type
  return (req, res, next) => {
      const authTypes = req.client.authTypes;

      if (authTypes.indexOf('UniqueCode') !== -1) {
        new UniqueCode({ clientId: req.client.id, userId: req.user.id })
        .fetch()
        .then((codeResponse) => {
          if (!!codeResponse) {
            next();
          } else {
            throw new Error('Not validated with Unique Code');
          }
        })
        .catch((error) => {
          if (errorCallback) {
            try {
              errorCallback(req, res, next);
            } catch (err) {
              next(err)
            }
          } else {
            next(error);
          }
        });

      } else {
        next();
      }
    }
}


/**
 * Check if required fields is set
 */
exports.checkRequiredUserFields = (req, res, next) => {
  const requiredFields = req.client.requiredUserFields;
  const user = req.user;
  let error;

  if (requiredFields) {
    requiredFields.forEach((field) => {
      // if at least one required field is empty, set to error
      error = error || !req.user[field];
    });
  }

  // if error redirect to register
  if (error) {
    res.redirect(`/auth/required-fields?clientId=${req.client.clientId}&redirect_uri=${req.query.redirect_uri}`);
  } else {
    next();
  }
}

exports.create =  (req, res, next) => {
  const { name, description, exposedUserFields, requiredUserFields, siteUrl, redirectUrl, authTypes, config, allowedDomains } = req.body;
  const rack = hat.rack();
  const clientId = rack();
  const clientSecret = rack();

  const values = { name, description, exposedUserFields, requiredUserFields, siteUrl, redirectUrl, authTypes, clientId, clientSecret, allowedDomains, config};

  values.exposedUserFields = JSON.stringify(values.exposedUserFields);
  values.requiredUserFields = JSON.stringify(values.requiredUserFields);
  values.authTypes = JSON.stringify(values.authTypes);
  values.config = JSON.stringify(values.config);
  values.allowedDomains = JSON.stringify(values.allowedDomains);


  new Client(values)
    .save()
    .then((client) => {
      req.clientModel = client;
      req.client = client.serialize();
      next();
    })
    .catch((err) => { next(err); });
}

exports.update = (req, res, next) => {
  const { name, description, exposedUserFields, requiredUserFields, redirectUrl, siteUrl, authTypes, config, allowedDomains } = req.body;

  req.clientModel.set('name', name);
  req.clientModel.set('description', description);
  req.clientModel.set('siteUrl', siteUrl);
  req.clientModel.set('redirectUrl', redirectUrl);
  req.clientModel.set('exposedUserFields', JSON.stringify(exposedUserFields));
  req.clientModel.set('requiredUserFields', JSON.stringify(requiredUserFields));
  req.clientModel.set('authTypes', JSON.stringify(authTypes));
  req.clientModel.set('config', JSON.stringify(config));
  req.clientModel.set('allowedDomains', JSON.stringify(allowedDomains));

  req.clientModel
    .save()
    .then((client) => {
      console.log('update success');
      next();
    })
    .catch((err) => {
      console.log('update err', err);
      next(err);
    })
}



exports.deleteOne = (req, res, next) => {
  req.clientModel
    .destroy()
    .then((response) => {
      next();
    })
    .catch((err) => { next(err); })
}
