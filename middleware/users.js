const User = require('../models').User;

exports.withAll = () => {
  User
    .fetchAll()
    .then((response) => {
      req.users = response.serialize();
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.withOne = (req, res, next) => {
  new User({
    id: req.userId
  })
    .fetch()
    .then((response) => {
      req.user = response;
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.withOneByEmail = (req, res, next) => {
  User.
    .where({ email: req.body.email })
    .fetch()
    .then((user) => {
      req.user = response;
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.validate = () => {

}
