const Role = require('../models').Role;

exports.withAll = (req, res, next) => {
  Role
  .fetchAll()
  .then((roles) => {
     req.rolesCollection = roles;
     req.roles = roles.serialize();
     next();
  })
  .catch((err) => { next(err); });
}


exports.withOne = (req, res, next) => {
  const roleId = req.body.roleId ? req.body.roleId : req.params.roleId;

  new Role({
    id: roleId
  })
    .fetch()
    .then((role) => {
      req.roleModel = role;
      req.role = role.serialize();
      next();
    })
    .catch((err) => { next(err); });
}
