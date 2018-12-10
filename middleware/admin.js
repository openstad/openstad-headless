const adminClientId = process.env.ADMIN_CLIENT_ID;
const Client = require('../models').Client;

exports.ensure = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    throw new Error('Forbidden');
  }
}


exports.addClient = (req, res, next) => {
  new Client({id: adminClientId})
    .fetch()
    .then((clientModel) => {
      req.clientModel = clientModel;
      req.client = clientModel.serialize();
      next();
    })
    .catch((err) => {
      next(err);
    });
}
