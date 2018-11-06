const User = require('../models').User;

exports.withAll = (req, res, next) => {
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
    id: req.params.userId
  })
    .fetch()
    .then((response) => {
      req.user = response.serialize();
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.withOneByEmail = (req, res, next) => {
  new User({ email: req.body.email })
    .fetch()
    .then((user) => {
      console.log('user response', user);

      req.user = user.serialize();
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.validate = (req, res, next) => {

}
