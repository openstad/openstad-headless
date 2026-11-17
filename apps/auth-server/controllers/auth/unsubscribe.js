const sanitize = require('../../utils/sanitize');

exports.info = (req, res, next) => {
  res.render('auth/unsubscribe', {
    title: sanitize.plainText(req.client?.name || ''),
    clientId: sanitize.plainText(req.client?.clientId || ''),
    client: sanitize.client(req.client),
  });
};
