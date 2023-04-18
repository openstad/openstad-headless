const { check }             = require('express-validator/check')
const db                    = require('../db');
const userProfileValidation = require('../config/user').validation.profile;
const bcrypt                = require('bcrypt');
const hat                   = require('hat');
const saltRounds            = 10;
const Promise               = require('bluebird');


exports.withAll = (req, res, next) => {

  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;
  const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
  const search = req.query.search ? req.query.search : false;

  let where = {};

  if (search) {
    where = {
      [db.Sequelize.Op.or]: [
        { email: { [db.Sequelize.Op.like]: '%' +search+ '%' } },
        { firstName: { [db.Sequelize.Op.like]: '%' +search+ '%' } },
        { lastName: { [db.Sequelize.Op.like]: '%' +search+ '%' } },
      ],
    }
  }

  // deze slaat nergens op en heb ik dus verwijderd
  // if (req.query.clientId) {
  //   where.clientId = req.client.id;
  // }

  if (req.query.email) {
    where.email = req.query.email;
  }

  db.User
    .findAll({ where, limit, offset, order: [['id', 'DESC']] })
    .then((response) => {
      req.users = response;
      req.users = req.users.map((user) => {
        return user;
      })
      req.totalCodeCount = response.length;
      next();
    })
    .catch((err) => {
      console.log('error', err)
      next(err);
    });
}

exports.withOne = (req, res, next) => {
  const userId = req.body.userId ? req.body.userId : req.params.userId;
  db.User
    .scope(['includeUserRoles'])
    .findOne({ where: { id: userId  }})
    .then((user) => {
      req.userObject = user;
      next();
    })
    .catch((err) => {
      next(err);
    });
}

exports.withRoleForClient = (req, res, next) => {

  db.UserRole
    .findOne({ where: { userId: req.user.id, clientId: req.client.id } })
     .then((userRole) => {

       if (userRole) {
         const roleId = userRole.roleId;

         db.Role
           .findOne({ where: {id: roleId} })
           .then((role) => {
             if (role) {
               req.user.role = role.name;
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
  db.User
    .findOne({ where: { email: req.body.email } })
    .then((user) => {
      req.userObject = user;

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
  let { firstName, lastName, email, streetName, houseNumber, suffix, postcode, city, phoneNumber, hashedPhoneNumber, password, extraData } = req.body;
  const rack = hat.rack();

  // if empty create a random string
  password = password ? password : rack();
  password = bcrypt.hashSync(password, saltRounds);
  extraData = extraData ? extraData : {};
  extraData = JSON.stringify(extraData);

  db.User
    .create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      streetName: streetName,
      houseNumber: houseNumber,
      suffix: suffix,
      postcode: postcode,
      city: city,
      phoneNumber: phoneNumber,
      password: password,
      extraData: extraData
    })
    .then(user => {
      req.userObject = user;
      next();
    })
    .catch((err) => {
      next(err);
    });

}

exports.update = (req, res, next) => {
  const keysToUpdate = ['firstName', 'lastName', 'email', 'streetName', 'houseNumber', 'suffix', 'postcode', 'city', 'phoneNumber', 'hashedPhoneNumber', 'password', 'requiredFields', 'exposedFields', 'authTypes', 'extraData', 'twoFactorConfigured', 'twoFactorToken'];

  let data = {};
  keysToUpdate.forEach((key) => {
    if (req.body[key] || req.body[key] === 0 || req.body[key] === null  || req.body[key] === false) {
      let value = req.body[key];

      if (key === 'extraData') {
        value = value ? value : {};
        value = JSON.stringify(value);
      }

      if (key === 'password' && value) {
        value = bcrypt.hashSync(value, saltRounds);
      }

      data[key] = value;
    }
  });

  req.userObject.update(data)
    .then(user => {
      req.userObject = user;
      next();
    })
    .catch((err) => {
      console.log('==> update err', err);
      next(err);
    });
}

exports.saveRoles = (req, res, next) => {
  const roles = req.body.roles;

  // console.log(' typeof req.body.roles',  typeof req.body.roles,  req.body.roles)

  if (!roles || typeof req.body.roles !== 'object') {
    next();
  } else {
    const userId = req.userObject.id;
    const saveRoles = [];

    Object.keys(roles).forEach((clientId) => {
      if (clientId) {
        let roleId = roles[clientId] ? roles[clientId] : false;
        roleId = parseInt(roleId, 10)

        if (roleId && Number.isInteger(roleId)){
          let parsedClientId = parseInt(clientId.replace('\'', ''), 10);
          saveRoles.push(() => { return createOrUpdateUserRole(parsedClientId, userId, roleId)});
        }
      }
    });

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
    db.UserRole
      .findOne({ where: {clientId, userId} })
      .then((userRole) => {
        if (userRole) {
          return userRole.update({'roleId': roleId});
        } else {
          return db.UserRole.create({ clientId, roleId, userId });
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
  db.User
    .findOne({ where: { email: req.body.email  } })
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
  req.userObject
    .destroy()
    .then(() => {
      next();
    })
    .catch((err) => { next(err); });
}
