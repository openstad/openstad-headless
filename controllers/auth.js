'use strict';
const passport          = require('passport');
const bcrypt            = require('bcrypt');
const saltRounds        = 10;
const hat               = require('hat');
const User              = require('../models').User;
const login             = require('connect-ensure-login');
const tokenUrl          = require('../services/tokenUrl');
const emailService      = require('../services/email');



/*
exports.account =  (req, res) => {
  res.render('user/profile', { user: req.user });
};
*/
