/**
 * Controller responsible for handling the password forgot
 * (login in with a link, mainly send by e-mail)
 */
 const passport          = require('passport');
 const bcrypt            = require('bcrypt');
 const saltRounds        = 10;
 const hat               = require('hat');
 const login             = require('connect-ensure-login');
 const User              = require('../../models').User;
 const tokenUrl          = require('../../services/tokenUrl');
 const emailService      = require('../../services/email');

 exports.forgot = (req, res) => {
   res.render('auth/forgot/forgot');
 };

 exports.reset = (req, res) => {
   res.render('auth/forgot/reset', {
     token: req.query.token
   });
 };

 exports.postReset = (req, res, next) => {

 }

 exports.postForgot = (req, res, next) => {

 }
