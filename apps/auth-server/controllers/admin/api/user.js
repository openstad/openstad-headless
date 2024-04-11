const db = require('../../../db');
const hat = require('hat');
const getClientIdFromRequest = require('../../../utils/getClientIdFromRequest');

const outputUser = (req, res, next) => {
  let result = { ...req.userObject };
  result = result.dataValues;
  delete result.password;
  delete result.hashedPhoneNumber;
  if (result.roles) {
    result.roles.map(role => {
      let client = req.clients.find(c => c.id == role.clientId);
      role.clientId = client.clientId;
    })
    let clientId = getClientIdFromRequest(req);
    if (clientId) {
      let roles = result.roles.filter( role => role.clientId == clientId).map (role => role.roleId);
      if (roles.length == 1) {
        let roleId = roles[0];
        let role = req.roles.find( role => role.id == roleId );
        result.role = role?.name;
      }
    }
  }
  res.json(result);
};

exports.all = (req, res, next) => {
    res.json({
        total: req.totalCodeCount,
        data: req.users
    });
};

exports.show = [
    outputUser
];

exports.create = [
    outputUser
];

exports.update = [
    outputUser
];

exports.delete = [
    (req, res, next) => {
        res.json({'message': 'Deleted!'})
    }
]

exports.csrfSessionToken = [
    (req, res, next) => {
        const rack = hat.rack();
        const token = rack();

        db.ExternalCsrfToken
            .create({
                token: token,
                used: false
            })
            .then((response) => {
                res.json({'token': token})
            })
            .catch((err) => {
                next(err);
            });
    }
]
