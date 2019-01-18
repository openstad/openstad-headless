const ActionLog = require('../models').ActionLog;

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
    .then(() => { next();
    })
    .catch((err) => {
      console.log('==> err ', err);
      next(err);
    });
  }
}


exports.logPostUniqueCode = (req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      const values = {
        method: 'post',
        name: 'UniqueCode',
        value: req.body.unique_code,
        clientId: req.client.id,
        ip: ip
      }


      try {
        new ActionLog(values)
          .save()
          .then(() => {
            next();
          })
          .catch((err) => {
            console.log('==> err ', err);
            next(err);
          });
      } catch (e) {
        console.log('==> errrr ', e);
      }
}
