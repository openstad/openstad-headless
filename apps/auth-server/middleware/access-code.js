const db = require('../db');
const generateCode = require('../utils/generateCode');
const Tasks = require('../memoryStorage/tasks');

exports.withAll = (req, res, next) => {

  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
  const search = req.query.search ? req.query.search : false;

  let where = { deletedAt: null };

  if (req.query.clientId) {
    where.clientId = req.client.id;
  }

  if (search) {
    where.code = { [db.Sequelize.Op.like]: '%' +search+ '%' };
  }

  db.AccessCode
    .findAll({ where, limit, offset, order: [['id', 'DESC']] })
    .then((codes) => {
      req.codes = codes;

      return db.AccessCode
        .count({ where: { clientId: req.client.id }})
    })
    .then((total) => {
      req.totalCodeCount = total;
      next();
    })
    .catch((err) => { next(err); });
}

exports.validate = (req, res, next) => {
  const codeId = req.body.codeId ? req.body.codeId : req.params.codeId;

  db.AccessCode
    .findOne({ where: { code: codeId, deletedAt: null } })
    .then((codeObj) => {
      res.json({ data: codeObj?.code });
    })
    .catch((err) => {
      res.json({ data: null });
    });
}


exports.create = async (req, res, next) => {
  const newCode = req.query.code;
  if (!newCode) {
    return next(new Error('No code provided'));
  }

  db.AccessCode
    .create({
      code: newCode,
      clientId: req.client.id,
    })
    .then((code) => {
      req.code = code;
      next();
    })
    .catch((err) => {
      console.log('create err', err);
      next(err);
    })
}

exports.deleteOne = (req, res, next) => {
  const codeId = req.body.codeId ? req.body.codeId : req.params.codeId;

  db.AccessCode
    .findOne({ where: { id: codeId } })
    .then((code) => {
      if (!code) {
        throw new Error('Access code not found');
      }

      code.update({ deletedAt: new Date() });
      return;
    })
    .then(() => {
      next();
    })
    .catch((err) => { next(err); });
}
