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
  new Client({
    id: req.params.clientId
  })
  .fetch()
  .then((response) => {
     console.log('client response', response.serialize());
     req.client = response.serialize();
     next();
  })
  .catch((err) => {
    next(err);
  });
}

exports.validate = (req, res, next) => {

}
