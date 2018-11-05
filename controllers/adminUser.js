const User = require('../models').User;

exports.all = (req, res) => {
  res.render('user/all', {
    users: req.users
  });
}

exports.edit = (req, res) => {
  res.render('user/edit', {
    user: req.user
  });
}

exports.update = (req, res) => {
  res.render('user/new');
}

/**
 * @TODO validation
 */
exports.create = () => {
  let { firstName, lastName, email, street_name, house_number, suffix, postcode, city, phone, password } = req.body;

  password = bcrypt.hashSync(password, saltRounds);

  new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    street_name: street_name,
    house_number: house_number,
    suffix: suffix,
    postcode: postcode,
    city: city,
    phone: phone,
    password: password
  })
  .save()
  .then((response) => {
    req.flash('success', { msg: 'Succesfully created '});
    res.redirect('/admin/client/' + response.id );
  })
  .catch((err) => {
    next(err);
  });
}

exports.update = (req, res) => {
  const keysToUpdate = ['firstName', 'lastName', 'email', 'street_name', 'house_number', 'suffix', 'postcode', 'city', 'phone', 'password'];

  keysToUpdate.forEach((key) => {
    if (req.body[key]) {
      let value = req.body[key];

      if (key === 'password') {
        value = bcrypt.hashSync(value, saltRounds);
      }

      req.client.set(key, value);
    }
  });

  req.client
    .save()
    .then(() => {
      req.flash('success', { msg: 'Updated client!' });
      res.redirect('/admin/client/' + response.id);
    })
    .catch((err) => {
      next(err);
    })
}
