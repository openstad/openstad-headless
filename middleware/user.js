const User = require('../models').User;
const { check } = require('express-validator/check')
const userProfileValidation = require('../config/user').validation.profile;

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
  const userId = req.body.userId ? req.body.userId : req.params.userId;

  new User({
    id: userId
  })
    .fetch()
    .then((user) => {
      req.userModel = user;
      req.user = user.serialize();
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.withOneByEmail = (req, res, next) => {
  const email = req.body.email ? req.body.email : req.query.email;
  new User({ email: req.body.email })
    .fetch()
    .then((user) => {
      req.userModel = user;
      req.user = user.serialize();
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.validateUser = (req, res, next) => {
/*  userFields.forEach ((field) => {
    let fields = req.assert(field.key, field.message)

    if (field.required) {
      fields.not().isEmpty();
    }

    console.log('fields', field);

    if (field.maxLength) {
      fields.isLength({ maxLength: fields.maxLength });
    }

    if (field.email) {
      fields.isEmail();
    }
  });
*/

  /**
   * Set user email to the body, in order to validate the email in user
   */
  if (!req.body.email && req.user) {
    req.body.email = req.user.email;
  }

  req.check(userProfileValidation);

  req.check('email').custom(value => {
    return
      new User({ email: value  })
        .then(user => {
          if (user) {
            return Promise.reject('E-mail already in use');
          }
        });
  });

  req.getValidationResult()

//  const errors = req.validationResult();
  var errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    res.redirect(req.header('Referer') || '/account');
  } else {
    next();
  }
}

exports.validatePassword = (req, res, next) => {
  if (
    req.body.password
    && req.body.password === req.body.password_confirm
    && req.body.password.length >= 5
  ) {
    next();
  } else {
    req.flash('error', {msg: 'Incorrect wachtwoord'});
    res.redirect(req.header('Referer') || '/account');
  }
}

exports.validateEmail = (req, res, next) => {
  if (
    req.body.email
    && req.body.email === req.user.email
  ) {
    next();
  } else {
    req.flash('error', {msg: 'Incorrect wachtwoord'});
    res.redirect(req.header('Referer') || '/account');
  }
}
