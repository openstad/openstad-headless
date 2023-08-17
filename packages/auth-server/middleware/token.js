const db = require('../db');

exports.addUser = ((req, res, next) => {
  const tokenToQuery = req.body.token ?  req.body.token : req.query.token;
  const minutes = 60;
  const msForAMinute = 60000;
  const date = new Date();
  const timeAgo = new Date(date.setTime(date.getTime() - (minutes * msForAMinute)));
  db.LoginToken
    .findOne({
      where: {
        token: tokenToQuery,
        valid: true,
        createdAt: { [db.Sequelize.Op.gte]: timeAgo }
      },
      order: [['createdAt', 'DESC']],
    })
    .then((token) => {
      if (token) {
        db.User
          .findOne({ where: { id: token.userId }})
          .then((user) => {
            req.user = user;
            next();
          })
          .catch((err) => {
            next(err);
          });
      } else {
        next({
          name: 'LoginTokenNotFound',
          msg: 'No token found.',
          status: 404,
        });
      }
    })
    .catch((err) => {
      next(err);
    });
});
