const Client = require('../models').Client;
const hat = require('hat');

exports.all = () => {
  res.render('client/all', {
    clients: req.clients
  });
}

exports.new = () => {
  res.render('client/new');
}

exports.edit = () => {
  res.render('client/edit', {
    client: req.client
  });
}

/**
 * @TODO validation
 */
exports.create = () => {
  const { name, description } = req.body;

  /**
   * Generate unique clientId & secret
   */
  const clientId = hat.rack();
  const clientSecret = hat.rack();

  new Client({
    name: name,
    description: description,
    clientId: clientId,
    clientSecret: clientSecret
  })
  .save()
  .then((response) => {
    req.flash('success', { msg: 'Succesfully created '});
    res.redirect('/admin/client/' + response.id  || '/');
  })
  .catch((err) => {
    next(err);
  })
}

exports.update = (req, res) => {
  const { name, description } = req.body;

  req.client.set('title', name);
  req.client.set('description', description);
  req.client
    .save()
    .then(() => {
      req.flash('success', { msg: 'Updated client!'});
      res.redirect('/admin/client/' + response.id  || '/');
    })
    .catch((err) => {
      next(err);
    })
}
