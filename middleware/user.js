const User = require('../models').User;
const { check } = require('express-validator/check')
const userFields = require('../config/userValidation').fields;

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

exports.validateUser = (req, res, next) => {
  console.log('usereusu');
  userFields.forEach ((field) => {
    let fields = req.assert(field.key, field.message);

    if (fields.required) {
      fields.notEmpty();
    }

    if (fields.maxLength) {
      fields.isLength({ maxLength: fields.maxLength });
    }

    if (fields.email) {
      fields.isEmail();
    }
  });

  const errors = req.validationResult();


  if (errors.isEmpty()) {
    next();
  } else {
    res.redirect('/clientsss');
  }
}

exports.validatePassword = (req, res, next) => {
  if (req.body.password !== req.body.passwordRepeat) {

  }
}
