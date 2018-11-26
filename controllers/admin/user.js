const bcrypt = require('bcrypt');
const User = require('../../models').User;
const saltRounds = 10;

exports.all = (req, res, next) => {
  res.render('user/all', {
    users: req.users
  });
}

exports.edit = (req, res) => {
  res.render('user/edit', {
    user: req.user
  });
}

exports.new = (req, res) => {
  res.render('user/new');
}

/**
 * @TODO validation
 */
exports.create = (req, res, next) => {
  let { firstName, lastName, email, street_name, house_number, suffix, postcode, city, phone, password } = req.body;

  password = bcrypt.hashSync(password, saltRounds);

  new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    streetName: street_name,
    houseNumber: house_number,
    suffix: suffix,
    postcode: postcode,
    city: city,
    phoneNumber: phone,
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

exports.update = (req, res) => {
  const keysToUpdate = ['firstName', 'lastName', 'email', 'street_name', 'house_number', 'suffix', 'postcode', 'city', 'phone', 'password'];

  new User({id: req.user.id})
    .fetch()
    .then((user) => {
      keysToUpdate.forEach((key) => {
        if (req.body[key]) {
          user.set(key, req.body[key]);

          if (key === 'password') {
            value = bcrypt.hashSync(value, saltRounds);
          }
        }
      });

      user
        .save()
        .then(() => {
          req.flash('success', { msg: 'Updated client!' });
          res.redirect('/admin/client/' + response.id);
        })
        .catch((err) => {
          next(err);
        })
    });
}
