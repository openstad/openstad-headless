const loginFields = require('../config/user').loginFields;


exports.validateLogin = (req, res, next) => {
  req.check(loginFields);

  req.getValidationResult();

  //  const errors = req.validationResult();
  var errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    res.redirect(req.header('Referer') || '/account');
  } else {
    next();
  }
}
