const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const login             = require('connect-ensure-login');
const User              = require('../../models').User;
const tokenUrl          = require('../../services/tokenUrl');
const emailService      = require('../../services/email');

exports.login = (req, res, next) => {
  res.render('auth/unique-code', {
    client: req.client
  });
}

exports.login = (req, res, next) => {
  res.render('auth/unique-code', {
    client: req.client
  });
}
