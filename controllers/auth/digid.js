/**
 * NOT WORKING
 */
const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const login             = require('connect-ensure-login');
const User              = require('../../models').User;
const tokenUrl          = require('../../services/tokenUrl');
const emailService      = require('../../services/email');

exports.login = (req, res, next) => {
  res.redirect('https://www.digid.nl');

/*
  res.render('auth/digid/login', {
    client: req.client,
    clientId: req.client.clientId
  });
  */
}

exports.postLogin = (req, res, next) => {
  // redirect
  res.redirect('https://www.digid.nl');
}
