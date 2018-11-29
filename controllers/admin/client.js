const hat = require('hat');
const Client = require('../../models').Client;
const userFields = require('../../config/user').fields;
const authTypes = require('../../config/auth').types;

/**
 * [all description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.all = (req, res, next) => {
  res.render('admin/client/all', {
    clients: req.clients
  });
}

/**
 * [new description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.new = (req, res, next) => {
  res.render('admin/client/new', {
    requiredUserFields: userFields,
    exposedUserFields: userFields,
    authTypes: authTypes
  });
}


exports.edit = (req, res, next) => {
  res.render('admin/client/edit', {
    client: req.client,
    requiredUserFields: userFields,
    exposedUserFields: userFields,
    authTypes: authTypes
  });
}

/**
 * [create description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.create = (req, res, next) => {
  const { name, description, exposedFields, requiredFields, authTypes } = req.body;
  const rack = hat.rack();
  const clientId = rack();
  const clientSecret = rack();

  new Client({ name, description, exposedFields, requiredFields, authTypes, clientId, clientSecret })
    .save()
    .then((response) => {
      req.flash('success', { msg: 'Succesfully created '});
      res.redirect('/admin/client/' + response.id  || '/');
    })
    .catch((err) => { next(err); });
}

exports.update = (req, res) => {
  const { name, description } = req.body;

  req.client.set('title', name);
  req.client.set('description', description);
  req.client
    .save()
    .then((response) => {
      req.flash('success', { msg: 'Updated client!'});
      res.redirect('/admin/client/' + response.get('id')  || '/');
    })
    .catch((err) => { next(err); })
}
