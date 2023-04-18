const db = require('../db');

exports.withAll = (req, res, next) => {
  db.Role
  .findAll()
  .then((roles) => {
     req.roles = roles;
     next();
  })
  .catch((err) => { next(err); });
}


exports.withOne = (req, res, next) => {
  const roleId = req.body.roleId ? req.body.roleId : req.params.roleId;

  db.Role
    .findOne({ where: { id: roleId } })
    .then((role) => {
      req.role = role;
      next();
    })
    .catch((err) => { next(err); });
}
