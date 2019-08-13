const LoginToken = require('../models').LoginToken;
const User       = require('../models').User;

exports.addUser = ((req, res, next) => {
  const tokenToQuery = req.body.token ?  req.body.token : req.query.token;
  new LoginToken({token: tokenToQuery, valid: true})
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
    .then((token) => {
      if (token) {
        new User
          ({id: token.get('userId')})
          .fetch()
          .then((user) => {
            req.userModel = user;
            req.user = user.serialize();
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
