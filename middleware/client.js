const Client = require('../models').Client;

exports.withAll = (req, res, next) => {
  Client
  .fetchAll()
  .then((response) => {
     req.clients = response.serialize();
     next();
  })
  .catch((err) => {
    next(err);
  });
}

exports.withOne = (req, res, next) => {
  const clientId = req.body.clientId ? req.body.clientId : req.query.clientId;

  if (clientId) {
    new Client({
      clientId: clientId
    })
    .fetch()
    .then((client) => {
       req.clientModel = client;
       req.client = client.serialize();
       next();
    })
    .catch((err) => {
      next(err);
    });
  } else {
    next({
      status: 500,
      msg: 'No clientID found'
    });

  }
}

exports.validate = (req, res, next) => {

}
