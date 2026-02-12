exports.info = (req, res, next) => {
  res.render('auth/unsubscribe', {
    title: req.client?.name || '',
    clientId: req.client?.clientId,
    client: req.client,
  });
};
