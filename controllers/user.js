const User = require('../models').user;

exports.profile = (req, res) => {
  res.render('user/new', {
    user: req.user
  });
}
