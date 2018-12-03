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
  const codeId = req.body.codeId ? req.body.codeId : req.params.codeId;

  new Role({
    id: codeId
  })
    .fetch()
    .then((role) => {
      req.roleModel = role;
      req.role = role.serialize();
      next();
    })
    .catch((err) => { next(err); });
}
