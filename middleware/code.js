const UniqueCode = require('../models').UniqueCode;
const generateCode = require('../utils/generateCode');

exports.withAll = (req, res, next) => {
  UniqueCode
    .query(function (qb) {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
      const search = req.query.search ? req.query.search : false;

      if (req.query.clientId) {
        qb.where('clientId',  req.client.id);
      }

      if (search) {
        qb.where('code', 'like', '%' +search+ '%')
      }

      qb.limit(limit);
      qb.offset(offset);
      qb.orderBy('id', 'DESC');

    })
    .fetchAll()
    .then((codes) => {
       req.codesCollection = codes;
       req.codes = codes.serialize();

       return UniqueCode
        .query((qb) => {
          qb.where('clientId',  req.client.id)
        })
        .count("id");
    //    .first();
    })
    .then((total) => {
      req.totalCodeCount = total;
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
  const promises = [];
  const amountOfCodes = req.query.amount ? req.query.amount : 1;

  // make a promise for every code to be created
  for (let i = 0; i < amountOfCodes; i++) {
    promises.push(
      new UniqueCode({
        code: generateCode(),
        clientId: req.client.id
      })
      .save()
    )
  };

  /**
   * Execute all promises
   */
  Promise.all(promises)
    .then(function (response) {
      //req.codeModel = code;
      //req.code = code.serialize();
      next();
    })
    .catch(function (err) {
      next(err)
    });
}



exports.deleteOne = (req, res, next) => {
  req.codeModel
    .destroy()
    .then(() => {
      next();
    })
    .catch((err) => { next(err); });
}
