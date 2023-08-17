const hat = require('hat');
const db = require('../../db');

exports.all = (req, res, next) => {
  res.render('admin/role/all', {
    roles: req.roles
  });
}

exports.new = (req, res, next) => {
  res.render('admin/role/new');
}

exports.edit = (req, res, next) => {
  res.render('admin/role/edit', {
    role: req.role
  });
}

/**
 * @TODO validation in middleware
 */
exports.create = (req, res, next) => {
  const { name} = req.body;

  db.Role()
    .create({ name })
    .then((response) => {
      req.flash('success', { msg: 'Succesfully created '});
      res.redirect('/admin/roles' || '/');
    })
    .catch((err) => { next(err); });
}

exports.update = (req, res, next) => {
  const { name } = req.body;

  req.role
    .update({name})
    .then((response) => {
      req.flash('success', { msg: 'Updated role!'});
      res.redirect('/admin/role/' + response.get('id')  || '/');
    })
    .catch((err) => { next(err); })
}
