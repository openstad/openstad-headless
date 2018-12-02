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
  const { name, description, exposedUserFields, requiredUserFields, siteUrl, redirectUrl, authTypes } = req.body;
  const rack = hat.rack();
  const clientId = rack();
  const clientSecret = rack();

  const values = { name, description, exposedUserFields, requiredUserFields, siteUrl, redirectUrl, authTypes, clientId, clientSecret };

  values.exposedUserFields = JSON.stringify(values.exposedUserFields);
  values.requiredUserFields = JSON.stringify(values.requiredUserFields);
  values.authTypes = JSON.stringify(values.authTypes);


  new Client(values)
    .save()
    .then((response) => {
      req.flash('success', { msg: 'Succesfully created '});
      res.redirect('/admin/client/' + response.id  || '/');
    })
    .catch((err) => { next(err); });
}

exports.update = (req, res) => {
  const { name, description, exposedUserFields, requiredUserFields, redirectUrl, siteUrl, authTypes } = req.body;

  req.client.set('title', name);
  req.client.set('description', description);
  req.client.set('siteUrl', siteUrl);
  req.client.set('redirectUrl', redirectUrl);
  req.client.set('exposedUserFields', JSON.stringify(exposedUserFields));
  req.client.set('requiredUserFields', JSON.stringify(requiredUserFields));
  req.client.set('authTypes', JSON.stringify(authTypes));

  req.client
    .save()
    .then((response) => {
      req.flash('success', { msg: 'Updated client!'});
      res.redirect('/admin/client/' + response.get('id')  || '/');
    })
    .catch((err) => { next(err); })
}
