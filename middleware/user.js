const { check }             = require('express-validator/check')
//const Promise               = require('bluebird');
const User                  = require('../models').User;
const UserRole              = require('../models').UserRole;
const Role                  = require('../models').Role;
const userProfileValidation = require('../config/user').validation.profile;
const bcrypt                = require('bcrypt');
const saltRounds            = 10;
const Promise               = require('bluebird');


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

  new User({ id: userId  })
    .fetch()
    .then((user) => {
      const userModel = user;
      const userData = user.serialize();

       UserRole
        .query(function(qb){ qb.where('userId' , userData.id) ; })
        .fetchAll()
        .then((userRoles) => {
          userData.roles = userRoles.serialize();
          req.userObjectModel = userModel;
          req.userObject = userData;
          next();
        });
    })
    .catch((err) => {
      next(err);
    });
}

exports.withRoleForClient = (req, res, next) => {

  new UserRole({ userId: req.user.id, clientId: req.client.id })
     .fetch()
     .then((userRole) => {

       if (userRole) {
         const roleId = userRole.get('roleId');

         console.log('roleId roleId', roleId);

         new Role ({id: roleId})
          .fetch()
          .then((role) => {
            if (role) {
              req.user.role = role.get('name');
            }
            next();
          })
          .catch((err) => {
            next(err);
          })
       } else {
         next();
       }
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
      req.userObjectModel = user;
      req.userObject = user.serialize();
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

/*
  req.check('email').custom((value) => {
    return new Promise((resolve, reject) => {
      new User({ email: value  })
        .fetch()
        .then((user) => {
          if (user) {
            //return Promise.reject('asadasdadsasd')
            throw new Error('E-mail al in gebruik!');
            //return reject('E-mail already in use');
          } else {
            return resolve();
          }
        });
    })
  });
*/
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

exports.create =  (req, res, next) => {
  let { firstName, lastName, email, streetName, houseNumber, suffix, postcode, city, phoneNumber, password } = req.body;

  password = bcrypt.hashSync(password, saltRounds);

  new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    streetName: streetName,
    houseNumber: houseNumber,
    suffix: suffix,
    postcode: postcode,
    city: city,
    phoneNumber: phoneNumber,
    password: password
  })
  .save()
  .then((response) => {
    req.userObject = response.serialize();
    req.userObjectModel = response;
    next();
  })
  .catch((err) => {
    next(err);
  });
}

exports.update = (req, res, next) => {
  const keysToUpdate = ['firstName', 'lastName', 'email', 'streetName', 'houseNumber', 'suffix', 'postcode', 'city', 'phoneNumber', 'password', 'requiredFields', 'exposedFields', 'authTypes'];

  keysToUpdate.forEach((key) => {
    if (req.body[key]) {
      let value = req.body[key];

      if (key === 'password') {
        value = bcrypt.hashSync(value, saltRounds);
      }

      req.userObjectModel.set(key, value);
    }
  });

  req.userObjectModel.save()
    .then((response) => {
      req.userObject = response.serialize();
      req.userObjectModel = response;
      next();
    })
    .catch((err) => {
      console.log('==> update err', err);

      next(err);
    });
}

exports.saveRoles = (req, res, next) => {
  const roles = req.body.roles;
  console.log('==> roles', roles);

  if (!roles) {
    next();
  } else {
    const userId = req.userObject.id;
    const saveRoles = [];

    for (clientId in roles) {
      let roleId = roles[clientId];
      let parsedClientId = parseInt(clientId.replace('\'', ''), 10);
      console.log('==> parsedClientId', parsedClientId);

      saveRoles.push(() => { return createOrUpdateUserRole(parsedClientId, userId, roleId)});
    }

    Promise
      .map(saveRoles, saveRole => saveRole())
      .then(() => { next(); })
      .catch((err) => {
         console.log('==> update err', err);
         next(err);
       });
  }
}

const createOrUpdateUserRole = (clientId, userId, roleId) => {
  return new Promise ((resolve, reject) => {
    new UserRole({clientId, userId})
      .fetch()
      .then((userRole) => {
        if (userRole) {
          userRole.set('roleId', roleId);
          return userRole.save();
        } else {
          return new UserRole({ clientId, roleId, userId }).save();
        }
      })
      .then(()=> {
        resolve()
      })
      .catch((err) => {
        reject(err)
      });
  });
}

exports.validateUniqueEmail  = (req, res, next) => {
  new User({ email: req.body.email  })
    .fetch()
    .then(user => {
      if (user) {
        req.flash('error', {
          msg: 'E-mail al in gebruik!'
        });
        res.redirect(req.header('Referer') || '/account');
      } else {
        next();
      }
    });
}

exports.validatePassword = (req, res, next) => {
  if (
    req.body.password
    && req.body.password === req.body.password_confirm
    && req.body.password.length >= 8
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
    req.flash('error', {msg: 'Incorrect email'});
    res.redirect(req.header('Referer') || '/account');
  }
}

exports.deleteOne = (req, res, next) => {
  req.userObjectModel
    .destroy()
    .then(() => {
      next();
    })
    .catch((err) => { next(err); });
}
