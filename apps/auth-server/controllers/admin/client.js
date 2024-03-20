const db = require('../../db');
const hat = require('hat');
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
    authTypes: authTypes,
  });
}


exports.edit = (req, res, next) => {
  const clientAuthTypes = req.client.authTypes;
  const clientExposedUserFields = req.client.exposedUserFields;
  const clientRequiredUserFields = req.client.requiredUserFields;

  res.render('admin/client/edit', {
    client: req.client,
    requiredUserFields: userFields,
    exposedUserFields: userFields,
    authTypes: authTypes,
    clientAuthTypes: clientAuthTypes,
    clientExposedUserFields: clientExposedUserFields,
    clientRequiredUserFields: clientRequiredUserFields,
    roles: req.roles,
    clients: req.clients
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
  const { name, description, exposedUserFields, requiredUserFields, redirectUrl, authTypes } = req.body;
  const rack = hat.rack();
  const clientId = rack();
  const clientSecret = rack();

  const values = { name, description, exposedUserFields, requiredUserFields, redirectUrl, authTypes, clientId, clientSecret };

  values.exposedUserFields = JSON.stringify(values.exposedUserFields);
  values.requiredUserFields = JSON.stringify(values.requiredUserFields);
  values.allowedDomains = JSON.stringify(values.allowedDomains);



  db.Client
    .create(values)
    .then((response) => {
      req.flash('success', { msg: 'Succesfully created '});
      res.redirect('/admin/client/' + response.id  || '/');
    })
    .catch((err) => { next(err); });
}

exports.update = (req, res, next) => {
  const { name, description, exposedUserFields, requiredUserFields, redirectUrl, authTypes } = req.body;

  req.client
    .update({
      name,
      description,
      redirectUrl,
      exposedUserFields,
      requiredUserFields,
      authTypes,
    })
    .then((response) => {
      req.flash('success', { msg: 'Updated client!'});
      res.redirect('/admin/client/' + response.get('id')  || '/');
    })
    .catch((err) => { next(err); })
}
