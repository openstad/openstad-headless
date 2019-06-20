const UniqueCode = require('../models').UniqueCode;
const generateCode = require('../utils/generateCode');

exports.withAll = (req, res, next) => {
  const publicClientId = req.params.clientId;
  //Careful client.id is different from req.params.clientId
  const query = req.query.clientId ? { clientId: req.client.id }: {};

//  console.log('query', query);

  UniqueCode
    .fetchAll(query)
    .then((codes) => {
      console.log('codes', codes);

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


exports.create = (req, res, next) => {
    new UniqueCode({
      code: generateCode(),
      clientId: req.client.id
    })
    .save()
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
