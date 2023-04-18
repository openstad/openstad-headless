const adminClientId = process.env.ADMIN_CLIENT_ID;
const db = require('../db');

exports.ensure = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    throw new Error('Forbidden');
  }
}


exports.addClient = (req, res, next) => {
  db.Client
    .findOne({ where: {id: adminClientId} })
    .then(client => {
      req.client = client;
      res.locals.client = req.client;
      next();
    })
    .catch((err) => {
      next(err);
    });
}
