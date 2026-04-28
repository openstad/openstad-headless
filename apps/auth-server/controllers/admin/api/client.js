const configAuthTypes = require('../../../config/auth').types;

const outputClient = (req, res, next) => {
  const client = req.client.toJSON ? req.client.toJSON() : { ...req.client };
  client.authTypeDefaults = {};
  for (const type of configAuthTypes) {
    client.authTypeDefaults[type.key] = { ...type };
  }
  res.json(client);
};

exports.all = (req, res, next) => {
  res.json(req.clients);
};

exports.show = [outputClient];

exports.create = [outputClient];

exports.update = [outputClient];

exports.delete = [
  (req, res, next) => {
    res.json({ message: 'Deleted!' });
  },
];
