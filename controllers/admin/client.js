const hat = require('hat');
const Client = require('../../models').Client;

exports.all = (req, res, next) => {
  res.render('client/all', {
    clients: req.clients
  });
}

exports.new = (req, res, next) => {
  res.render('client/new');
}

exports.edit = (req, res, next) => {
  res.render('client/edit', {
    client: req.client
  });
}

/**
 * @TODO validation
 */
exports.create = (req, res, next) => {
  const { name, description } = req.body;

  /**
   * Generate unique clientId & secret
   */
  const rack =  hat.rack();
  const clientId = rack();
  const clientSecret = rack();
  const data = {
    name: name,
    description: description,
    clientId: clientId,
    clientSecret: clientSecret
  };

  new Client(data)
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
