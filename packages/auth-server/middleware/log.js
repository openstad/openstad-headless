const db = require('../db');

/**
 * Add the login option
 */
exports.logAction = (action) => {
  return (req, res, next) => {
    db.ActionLog()
    .create({
      action: action,
      userId: req.user.id,
      clientId: req.client.id,
    })
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
        db.ActionLog
          .create(values)
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

exports.logPostUrlLogin = (req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      const values = {
        method: 'post',
        name: 'Url',
        value: 'login',
        clientId: req.client.id,
        ip: ip
      };

      try {
        db.ActionLog
          .create(values)
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
