const bcrypt = require('bcrypt');
const User = require('../../models').User;
const UserRole = require('../../models').UserRole
const saltRounds = 10;
const Promise = require('bluebird');

exports.all = (req, res, next) => {
  res.render('admin/user/all', {
    users: req.users
  });
}

exports.edit = (req, res) => {
  const userRoles = req.user.roles;

  const userClients = req.clients.map((client) => {
    client.userRole =  userRoles ? userRoles.find(userRole => userRole.clientId === client.id) : {};
    return client;
  });

  res.render('admin/user/edit', {
    user: req.userObject,
    roles: req.roles,
    clients: userClients,
    userRoles: userRoles
  });
}

exports.new = (req, res) => {
  res.render('admin/user/new',  {
    roles: req.roles,
    clients: req.clients
  });
}

/**
 * @TODO validation
 */
exports.create = (req, res, next) => {
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
    req.flash('success', { msg: 'Succesfully created '});
    res.redirect('/admin/user/' + response.id );
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

  const roles = req.body.roles;
  const userId = req.params.userId;

  const saveRoles = [];


  console.log('roles', roles)

  for (clientId in roles) {
    let roleId = roles[clientId];
    let parsedClientId = parseInt(clientId.replace('\'', ''), 10);
    console.log('parsedClientId', parsedClientId)
    saveRoles.push(() => { return createOrUpdateUserRole(parsedClientId, userId, roleId)});
  }


  Promise.map(saveRoles, (saveRole) => {
    return saveRole();
  })
  .then(() => {
    return req.userObjectModel.save();
  })
  .then(() => {
    req.flash('success', { msg: 'Updated user!' });
    res.redirect('/admin/user/' + req.userObject.id);
  })
  .catch((err) => {
    req.flash('error', { msg: 'Error!' });
    res.redirect('/admin/user/' + req.userObject.id);
  })

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
