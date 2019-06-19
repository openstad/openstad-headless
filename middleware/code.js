const UniqueCode = require('../models').UniqueCode;

exports.withAll = (req, res, next) => {
  const publicClientId = req.params.clientId;

  UniqueCode
  .fetchAll()
  .then((codes) => {
     req.codesCollection = codes;
     req.codes = codes.serialize();
     next();
  })
  .catch((err) => { next(err); });
}

exports.withOne = (req, res, next) => {
  const codeId = req.body.codeId ? req.body.codeId : req.params.codeId;

  new UniqueCode({ id: codeId })
    .fetch()
    .then((code) => {
      req.codeModel = code;
      req.code = code.serialize();
      next();
    })
    .catch((err) => { next(err); });
}

exports.deleteOne = (req, res, next) => {
  req.codeModel
    .destroy()
    .then(() => {
      next();
    })
    .catch((err) => { next(err); });
}
