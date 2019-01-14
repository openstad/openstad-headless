const UniqueCode = require('../models').UniqueCode;

console.log('log log');


exports.withAll = (req, res, next) => {
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

  new UniqueCode({
    id: codeId
  })
    .fetch()
    .then((code) => {
      req.codeModel = code;
      req.code = code.serialize();
      next();
    })
    .catch((err) => { next(err); });
}
