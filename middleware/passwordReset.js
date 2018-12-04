const PasswordResetToken = require('../models').PasswordResetToken;
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
        throw new Error('No token found');
      }
    })
    .catch((err) => {
      next(err);
    });
}
