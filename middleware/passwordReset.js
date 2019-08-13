const PasswordResetToken = require('../models').PasswordResetToken;
const User = require('../models').User;

exports.validate = (req, res, next) => {
  const queryToken = req.query.token ? req.query.token : req.body.token;

  new PasswordResetToken({
    token: queryToken,
    valid: true
  })
      .query((q) => {
        /**
         * Only select tokens that are younger then 60 min
         */
        const minutes = 60;
        const msForAMinute = 60000;
        const date = new Date();
        const timeAgo = new Date(date.setTime(date.getTime() - (minutes * msForAMinute)));

        q.where('createdAt', '>=', timeAgo);
        q.orderBy('createdAt', 'DESC');
    })
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
