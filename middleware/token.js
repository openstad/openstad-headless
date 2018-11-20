const LoginToken = require('./models').LoginToken;
const User       = require('./models').User;

exports.addUser((req, res, next) => {
  new LoginToken({token: token}).query((q) => {
    /**
     * Only select tokens that are younger then 2 days
     * created_at is "bigger then" 48 hours ago
     */
    const days = 2;
    const msForADay = 86400000;
    const timeAgo = new Date(date.setTime(date.getTime() + (days * msForADay)));
    q.where('createdAt', '>=', timeAgo);
    q.orderBy('createdAt', 'DESC');
  })
  .fetch()
  .then((token) => {
    if (token) {
      new User({id: token.get('userId')})
        .then()
        .fetch((user) => {
          req.user = user.serialize();
          next();
        })
        .catch((err) => {
          next(err);
        });
    } else {
      next({
        name: 'LoginTokenNotFound',
        message: 'No token found.',
        status: 404,
      });
    }
  });
});
