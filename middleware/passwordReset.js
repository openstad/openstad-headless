const PasswordResetToken = require('../models').LoginToken;
const User = require('../models').User;

exports.validate = (req, res, next) => {
  const queryToken = req.query.token ? req.query.token : req.body.token;

  new PasswordResetToken({token: queryToken})
    .fetch()
    .then((passwordResetToken) => {
      // if token found validate, otherwise throw error
      if (passwordResetToken) {
        req.passwordResetToken = passwordResetToken.serialize();
        req.body.userId = passwordResetToken.get('userId');
        next();
      } else {
        next({
          name: 'NoTokenFound',
          status: 404,
          message: 'Token not found or expired.'
        });
      }
    })
    .catch((err) => {
      next(err);
    });
}
