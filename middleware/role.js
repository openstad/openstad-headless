const Role = require('../models').Rolert;

exports.withOne = (req, res, next) => {
  const codeId = req.body.codeId ? req.body.codeId : req.params.codeId;

  new Role({
    id: codeId
  })
    .fetch()
    .then((code) => {
      req.roleModel = code;
      req.role = code.serialize();
      next();
    })
    .catch((err) => { next(err); });
}
