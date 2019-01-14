const ActionLog = require('../models').ActionLog;

console.log('log log');

/**
 * Add the login option
 */
exports.logAction = (action) => {
  return (req, res, next) => {

    new ActionLog({
      action: action,
      userId: req.user.id,
      clientId: req.client.id,
    })
    .save()
    .then(() => {
      next();
    })
    .catch((err) => {
      console.log('==> err ', err);
      next(err);
    });
  }
}


exports.logPostUniqueCode = (req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      new ActionLog({
        method: 'post',
        name: 'UniqueCode',
        value: req.body.code,
        
        clientId: req.client.id,
        ip: ip
      })
      .save()
      .then(() => {
        next();
      })
      .catch((err) => {
        console.log('==> err ', err);
        next(err);
      });
}
