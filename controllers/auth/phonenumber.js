/**
 * Controller responsible for handling the logic for phonenumber login
 */

'use strict';

const passport          = require('passport');
const md5               = require('md5');
const login             = require('connect-ensure-login');
const db                = require('../../db');
const authService       = require('../../services/authService');
const tokenSMS          = require('../../services/tokenSMS');
const authPhonenumberConfig = require('../../config/auth').get('Phonenumber');
const verificationService = require('../../services/verificationService');
const URL               = require('url').URL;

/**
 * Render the index.html or index-with-code.js depending on if query param has code or not
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */

exports.index = (req, res) => {
  if (req.user) {
    res.redirect('/account');
  } else {
    res.redirect('/login');
  }
};

/**
 * Render the login.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.login = (req, res) => {
  const config = req.client.config ? req.client.config : {};
  const configAuthType = config.authTypes && config.authTypes['Phonenumber'] ? config.authTypes['Phonenumber'] : {};

  res.render('auth/phonenumber/login', {
    loginUrl: authPhonenumberConfig.loginUrl,
    clientId: req.client.clientId,
    redirectUrl: encodeURIComponent(req.query.redirect_uri),
    client: req.client,
    title: configAuthType.loginTitle || configAuthType.title || authPhonenumberConfig.loginTitle || authPhonenumberConfig.title,
    subtitle: configAuthType.loginSubtitle || authPhonenumberConfig.loginSubtitle,
    description: configAuthType.loginDescription || configAuthType.description || authPhonenumberConfig.loginDescription || authPhonenumberConfig.description,
    label: configAuthType.loginLabel || configAuthType.label || authPhonenumberConfig.loginLabel || authPhonenumberConfig.label,
    helpText: configAuthType.loginHelpText || configAuthType.helpText || authPhonenumberConfig.loginHelpText || authPhonenumberConfig.helpText,
    buttonText: configAuthType.loginButtonText || configAuthType.buttonText || authPhonenumberConfig.loginButtonText || authPhonenumberConfig.buttonText,
  });
};

/**
 * Authenticate normal login = find or create user and send sms
 */

//Todo: move these methods to the user service
const createUser = async (phoneNumber) => {
  let hashedPhoneNumber = md5(phoneNumber)
  return db.User.create({ hashedPhoneNumber: hashedPhoneNumber });
}

const updateUser = async (user, phoneNumber) => {
  let hashedPhoneNumber = md5(phoneNumber)
  return user
    .update({ hashedPhoneNumber: hashedPhoneNumber })
}

const getUser = async (phoneNumber) => {
  let hashedPhoneNumber = md5(phoneNumber)
  return db.User.findOne({ where: { hashedPhoneNumber } });
}

exports.postLogin = async(req, res, next) => {
  const clientConfig = req.client.config ? req.client.config : {};

  req.redirectUrl = clientConfig && clientConfig.emailRedirectUrl ? clientConfig.emailRedirectUrl : encodeURIComponent(req.query.redirect_uri);
  const redirectUrl = req.query.redirect_uri ? req.query.redirect_uri : req.client.redirectUrl;

  try {
    // phoneNumber
    let phoneNumber = req.body.phoneNumber;
    phoneNumber = phoneNumber.replace(/^\+/, '00');
    phoneNumber = phoneNumber.replace(/[	 \-]/g, '');
    phoneNumber = phoneNumber.replace(/^06/, '00316'); // default NL

    if (!phoneNumber.match(/^[0-9]{7,16}$/)) throw new Error('Geen geldig telefoonnummer');

    phoneNumber = phoneNumber.replace(/^00316/, '+316'); // default NL

    // find or create user
    let user = await getUser(phoneNumber);
    if (user) {
      if (!user.hashedPhoneNumber) {
        user = await updateUser(user, phoneNumber);
      }
    } else {
      if (clientConfig.users && clientConfig.users.canCreateNewUsers === false) throw new Error('Cannot create new users');
      user = await createUser(phoneNumber, clientConfig);
    }
    req.user = user;

    // Redirect if it succeeds to authorize screen
    const authorizeUrl = `/auth/phonenumber/sms-code?redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&client_id=${req.client.clientId}&scope=offline`;

    // send sms
    req.user.phoneNumber = phoneNumber;
    await verificationService.sendSMS(req.user, req.client);
    req.flash('success', {msg: 'Een SMS met een code is verstuurd naar ' + phoneNumber});
    return res.redirect(authorizeUrl);
  } catch (err) {
    console.log('===> err', err);
    req.flash('error', { msg: authPhonenumberConfig.loginErrorMessage });
    res.redirect(`${authPhonenumberConfig.loginUrl}?redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&client_id=${req.client.clientId}&scope=offline`);

  }
};




/**
 * Render the smscode.html
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.smsCode = (req, res) => {
  const config = req.client.config ? req.client.config : {};
  const configAuthType = config.authTypes && config.authTypes['Phonenumber'] ? config.authTypes['Phonenumber'] : {};

  res.render('auth/phonenumber/sms-code', {
    loginUrl: authPhonenumberConfig.smsCodeUrl,
    clientId: req.client.clientId,
    redirectUrl: encodeURIComponent(req.query.redirect_uri),
    client: req.client,
    title: configAuthType.smsCodeTitle || configAuthType.title || authPhonenumberConfig.smsCodeTitle || authPhonenumberConfig.title,
    subtitle: configAuthType.smsCodeSubtitle || authPhonenumberConfig.smsCodeSubtitle,
    description: configAuthType.smsCodeDescription || configAuthType.description || authPhonenumberConfig.smsCodeDescription || authPhonenumberConfig.description,
    label: configAuthType.smsCodeLabel || configAuthType.label || authPhonenumberConfig.smsCodeLabel || authPhonenumberConfig.label,
    helpText: configAuthType.smsCodeHelpText || configAuthType.helpText || authPhonenumberConfig.smsCodeHelpText || authPhonenumberConfig.helpText,
    buttonText: configAuthType.smsCodeButtonText || configAuthType.buttonText || authPhonenumberConfig.smsCodeButtonText || authPhonenumberConfig.buttonText,
  });
};

exports.postSmsCode = (req, res, next) => {

  passport.authenticate('phonenumber', { session: false }, function(err, user, info) {

    const redirectUrl = req.query.redirect_uri ? req.query.redirect_uri : req.client.redirectUrl;

    // Redirect if it fails to the original auth screen
    if (!user) {
      req.flash('error', {msg: authPhonenumberConfig.smsCodeErrorMessage});
      return res.redirect(`${authPhonenumberConfig.loginUrl}?redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&client_id=${req.client.clientId}&scope=offline`);
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }

      // means user has succesfully validated phonenumber (
      req.brute.resetKey(req.bruteKey);
      return tokenSMS.invalidateTokensForUser(user.id)
        .then((response) => {
          const redirectToAuthorisation = () => {
            // Redirect if it succeeds to authorize screen
            //check if allowed url will be done by authorize screen
            const authorizeUrl = `/dialog/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
            return res.redirect(authorizeUrl);
          }

          req.brute.reset(() => {
            //log the succesfull login
            authService.logSuccessFullLogin(req)
              .then (() => { redirectToAuthorisation(); })
              .catch (() => { redirectToAuthorisation(); });
          });
        })
        .catch((err) => {
          next(err);
        });

    });

 })(req, res, next);

}
