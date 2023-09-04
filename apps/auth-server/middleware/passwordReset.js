const db = require('../db');

exports.validate = (req, res, next) => {
  const queryToken = req.query.token ? req.query.token : req.body.token;

  /**
   * Only select tokens that are younger then 60 min
   */
  const minutes = 60;
  const msForAMinute = 60000;
  const date = new Date();
  const timeAgo = new Date(date.setTime(date.getTime() - (minutes * msForAMinute)));

  db.PasswordResetToken
    .findOne({
      where: {
        token: queryToken,
        valid: true,
        'createdAt': { [db.Sequelize.Op.gte]: timeAgo }
      },
      order: [[ 'createdAt', 'DESC' ]]
    })
    .then((passwordResetToken) => {
      // if token found validate, otherwise throw error
      if (passwordResetToken) {
        req.passwordResetToken = passwordResetToken;
        req.body.userId = passwordResetToken.userId;
        req.userId = passwordResetToken.userId;

          next();
      } else {
        throw new Error('No token found');
      }
    })
    .catch((err) => {
      next(err);
    });
}
