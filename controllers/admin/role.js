const hat = require('hat');
const Role = require('../../models').Role;

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
    roles: req.role
  });
}

/**
 * @TODO validation in middleware
 */
exports.create = (req, res, next) => {
  const { name} = req.body;

  new Role({ name })
    .save()
    .then((response) => {
      req.flash('success', { msg: 'Succesfully created '});
      res.redirect('/admin/client/roles' || '/');
    })
    .catch((err) => { next(err); });
}

exports.update = (req, res) => {
  const { name, description } = req.body;

  req.roleModel.set('name', name);

  req.roleModel
    .save()
    .then((response) => {
      req.flash('success', { msg: 'Updated role!'});
      res.redirect('/admin/role/' + response.get('id')  || '/');
    })
    .catch((err) => { next(err); })
}
