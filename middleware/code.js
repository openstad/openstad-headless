const db = require('../db');
const generateCode = require('../utils/generateCode');
const Tasks = require('../memoryStorage/tasks');

exports.withAll = (req, res, next) => {

  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
  const search = req.query.search ? req.query.search : false;

  let where = {};

  if (req.query.clientId) {
    where.clientId = req.client.id;
  }

  if (search) {
    where.code = { [db.Sequelize.Op.like]: '%' +search+ '%' };
  }
  
  db.UniqueCode
    .findAll({ where, limit, offset, order: [['id', 'DESC']] })
    .then((codes) => {
       req.codes = codes;

       return db.UniqueCode
        .count({ where: { clientId: req.client.id }})
    })
    .then((total) => {
      req.totalCodeCount = total;
      next();
    })
    .catch((err) => { next(err); });
}

exports.withOne = (req, res, next) => {
  const codeId = req.body.codeId ? req.body.codeId : req.params.codeId;

  db.UniqueCode
    .findOne({ where: { id: codeId } })
    .then((code) => {
      req.code = code;
      next();
    })
    .catch((err) => { next(err); });
}


exports.create = async (req, res, next) => {

  const promises = [];
  const amountOfCodes = req.query.amount ? req.query.amount : 1;

  const amountOfCodesPerSecond = 250; // TODO: configurable

  // use tasks to keep track of the process
  let task = await Tasks.save(null, { amountOfCodes, generatedCodes: 0 });
  let taskId = req.taskId = task.taskId;

  // go on with response now; creating codes is done in the background
  next(null, { taskId });

  // create codes
  for (let i = 0; i < amountOfCodes; i++) {
    await new Promise((resolve, reject) => {
      setTimeout(function() {
        return db.UniqueCode
          .create({
            code: generateCode(),
            clientId: req.client.id
          })
          .then(result => {
            task.generatedCodes++;
            return Tasks.save(taskId, task);
          })
          .then(result => resolve() )
          .catch( async err => {
            task.error = err;
            await Tasks.save(taskId, task);
            reject(err)
          })
      }, 1000 / amountOfCodesPerSecond)
    })
      .catch(function (err) {
        throw err;
      });
  };

}

exports.reset = (req, res, next) => {
  const { userId } = req.body;

  req.code
    .update({userId: null})
    .then((code) => {
      next();
    })
    .catch((err) => {
      console.log('update err', err);
      next(err);
    })
}

exports.deleteOne = (req, res, next) => {
  req.code
    .destroy()
    .then(() => {
      next();
    })
    .catch((err) => { next(err); });
}
