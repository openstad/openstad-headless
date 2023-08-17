const passport = require('passport');

//CONTROLERS
const oauth2Controller = require('../controllers/oauth/oauth2');
const tokenController = require('../controllers/oauth/token');
const userController = require('../controllers/user/user');

//AUTH CONTROLLERS
const authChoose = require('../controllers/auth/choose');
const authUrl = require('../controllers/auth/url');
const authPhonenumber = require('../controllers/auth/phonenumber');
const authForgot = require('../controllers/auth/forgot');
const authAnonymous = require('../controllers/auth/anonymous');
const authLocal = require('../controllers/auth/local');
const authCode = require('../controllers/auth/code');
const authRequiredFields = require('../controllers/auth/required');
const authTwoFactor = require('../controllers/auth/twoFactor');

//MIDDLEWARE
const clientMw = require('../middleware/client');
const userMw = require('../middleware/user');
const bruteForce = require('../middleware/bruteForce');
const authMw = require('../middleware/auth');
const passwordResetMw = require('../middleware/passwordReset');
const logMw = require('../middleware/log');

//UTILS
const getClientIdFromRequest = require('../utils/getClientIdFromRequest');

//MODELS
const db = require('../db');

const loginBruteForce = bruteForce.user;
const uniqueCodeBruteForce = bruteForce.user;
const phonenumberBruteForce = bruteForce.userVeryRestricted;
const smsCodeBruteForce = bruteForce.user;
const emailUrlBruteForce = bruteForce.userVeryRestricted;

const csurf = require('csurf');


/**
 * In same case we want to directly submit to oAuth api from another url.
 * In order to allow for this we use one time session Tokens, that the external domain can fetch and
 * validate their request with, in this case we validatate
 * Currenlty we don't validate with the user sessions,
 * there is a very short expiration date.
 * and invalidate them after use.
 * We assume this is enough for now.
 * Theoretically the redirects of the oAuth protocol in this server,
 * don't allow for redirect back to an unauthorized domain, but in case that fails this is a backup
 */
const csrfProtection = async  (req, res, next) => {

  if (req.body && req.body.externalCSRF) {

    let csrfToken;

    try {
      /**
       * Only select tokens that are younger then 10 minutes
       */
      const minutes = 10;
      const date = new Date();
      const timeAgo = new Date(date.setTime(date.getTime() - (minutes * 60000)));

      csrfToken = await db.ExternalCsrfToken.findOne({
        where: {
          token: req.body.externalCSRF,
          createdAt: {
            [db.Sequelize.Op.gte]: timeAgo,
          },
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (e) {
      return next(e)
    }

    // in case a valid csrf token is found set to used it and move on.
    if (csrfToken) {
      try {
        await csrfToken.update({ 'used': true });
      } catch (e) {
        return next(e)
      }
      return next();
    } else {
      return next(new Error('Invalid CSRF token', 403));
    }

  } else {
    return csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE_OFF === 'yes' ? false : true,
        sameSite: process.env.CSRF_SAME_SITE_OFF === 'yes' ? false : true
      }
    })(req, res, next);
  }
}

const addCsrfGlobal = (req, res, next) => {
    req.nunjucksEnv.addGlobal('csrfToken', req.csrfToken());
    next();
};

module.exports = function (app) {

    app.use(function (req, res, next) {
        // load env sheets that have been set for complete Environment, not specific for just one client
        if (process.env.STYLESHEETS) {
            const sheets = process.env.STYLESHEETS.split(',');
            //make sure we
            res.locals.envStyleSheets = sheets;
        }

        // load env sheets that have been set for complete Environment, not specific for just one client
        if (process.env.LOGO) {
            res.locals.logo = process.env.LOGO;
        }

        if (process.env.DEFAULT_FAVICON) {
            res.locals.favicon = process.env.DEFAULT_FAVICON;
        }

        next();
    });

    /**
     * Log urls
     */
    app.use((req, res, next) => {
        let current_datetime = new Date();
        let formatted_date =
            current_datetime.getFullYear() +
            "-" +
            (current_datetime.getMonth() + 1) +
            "-" +
            current_datetime.getDate() +
            " " +
            current_datetime.getHours() +
            ":" +
            current_datetime.getMinutes() +
            ":" +
            current_datetime.getSeconds();
        let method = req.method;
        let url = req.url;
        let status = res.statusCode;
        let log = `[${formatted_date}] ${method}:${url} ${status}`;
        console.log(log);
        next();
    });


    app.get('/', authLocal.index);

    /**
     * Login routes for clients,
     * checks if one or more options of authentications is available
     * and either shows choice or redirects if one option
     */
    app.get('/login/:priviligedRoute?', clientMw.withOne, authChoose.index);

    /**
     * Shared middleware for all auth routes, adding client and bruteforce
     */
    app.use('/auth', [clientMw.withOne, bruteForce.global]);

    /**
     * Login & register with local login
     */
    //shared middleware
    const localSharedMW = [clientMw.setAuthType('Local'),  csrfProtection, addCsrfGlobal]
    //routes
    app.get('/auth/local/login/:priviligedRoute?', [...localSharedMW], clientMw.validate, authLocal.login);
    app.post('/auth/local/login/:priviligedRoute?',  [...localSharedMW],  csrfProtection, loginBruteForce, authMw.validateLogin, authLocal.postLogin);
    app.get('/auth/local/register',  [...localSharedMW],  csrfProtection, addCsrfGlobal, authLocal.register);
    app.post('/auth/local/register',  [...localSharedMW],  csrfProtection, addCsrfGlobal, userMw.validateUser, userMw.validateUniqueEmail, authLocal.postRegister);

    /**
     * Deal with forgot password
     */
    app.get('/auth/local/forgot',  [...localSharedMW], authForgot.forgot);
    app.post('/auth/local/forgot', [...localSharedMW], authForgot.postForgot);
    app.get('/auth/local/reset',  [...localSharedMW], passwordResetMw.validate, authForgot.reset);
    app.post('/auth/local/reset', [...localSharedMW], passwordResetMw.validate, userMw.validatePassword, authForgot.postReset);

    /**
     * Auth routes for URL login
     */
    // shared middleware
    ///app.use('/auth/url', );

    // routes
    app.get('/auth/url/login/:priviligedRoute?', clientMw.setAuthType('Url'), clientMw.validate, csrfProtection, addCsrfGlobal, authUrl.login);
    app.get('/auth/url/confirmation', clientMw.setAuthType('Url'),  csrfProtection, addCsrfGlobal, authUrl.confirmation);
    app.post('/auth/url/login/:priviligedRoute?', clientMw.setAuthType('Url'), csrfProtection, emailUrlBruteForce, authUrl.postLogin);
    app.get('/auth/url/authenticate', clientMw.setAuthType('Url'),  csrfProtection, addCsrfGlobal, authUrl.authenticate);
    app.post('/auth/url/authenticate', clientMw.setAuthType('Url'), csrfProtection, emailUrlBruteForce, authUrl.postAuthenticate);


    // admin login routes redirect to normal login but with priviliged params
    app.get('/auth/admin/login', [csrfProtection, addCsrfGlobal], (req, res, next) => {
        const queryIndex = req.originalUrl.indexOf('?');
        const queryString = (queryIndex>=0) ? req.originalUrl.slice(queryIndex) : '';

        res.redirect('/login/admin' + queryString);
    });

    /**
     * Auth routes for Anonymous login
     */
    // shared middleware
    app.use('/auth/anonymous', [clientMw.withOne, clientMw.setAuthType('Anonymous'), clientMw.validate, csrfProtection, addCsrfGlobal]);

    // routes
    app.get('/auth/anonymous/info', authAnonymous.info);
    app.get('/auth/anonymous/login', authAnonymous.login);
    app.get('/auth/anonymous/register', authAnonymous.register);

    /**
     * Auth routes for phone/sms login
     */
    // shared middleware
    app.use('/auth/phonenumber', [clientMw.withOne, clientMw.setAuthType('Phonenumber'), clientMw.validate]);

    // routes
    app.get('/auth/phonenumber/login', csrfProtection, addCsrfGlobal, authPhonenumber.login);
    app.post('/auth/phonenumber/login', csrfProtection, phonenumberBruteForce, authPhonenumber.postLogin);
    app.get('/auth/phonenumber/sms-code', csrfProtection, addCsrfGlobal, authPhonenumber.smsCode);
    app.post('/auth/phonenumber/sms-code', csrfProtection, smsCodeBruteForce, authPhonenumber.postSmsCode);

    /**
     * Auth routes for UniqueCode
     */
    app.use('/auth/code', [clientMw.withOne, clientMw.setAuthType('UniqueCode'), clientMw.validate]);
    app.get('/auth/code/login', csrfProtection, addCsrfGlobal, authCode.login);
    app.post('/auth/code/login',  csrfProtection, uniqueCodeBruteForce, logMw.logPostUniqueCode, authCode.postLogin);

    /**
     * Register extra info;
     * In case client specifies required fields
     */

    /**
     * Logout (all types :))
     */
    app.get('/logout', clientMw.withOne, authLocal.logout);

    /**
     * Show account, add client, but not obligated
     */
    app.use('/user', [clientMw.withOne, authMw.check]);
    app.get('/account', clientMw.withOne, authMw.check, csrfProtection, addCsrfGlobal, userController.account);
    app.post('/account', clientMw.withOne, authMw.check, csrfProtection, addCsrfGlobal, userMw.validateUser, userController.postAccount);
    app.post('/password', clientMw.withOne, authMw.check, csrfProtection, addCsrfGlobal, userMw.validatePassword, userController.postAccount);

    app.use('/auth/required-fields', [authMw.check, clientMw.withOne]);
    app.get('/auth/required-fields', clientMw.withOne, csrfProtection, addCsrfGlobal, clientMw.checkIfEmailRequired, authRequiredFields.index);
    app.post('/auth/required-fields', clientMw.withOne, csrfProtection, addCsrfGlobal, authRequiredFields.post);

    app.use('/auth/two-factor', [authMw.check, clientMw.withOne]);
    app.get('/auth/two-factor', clientMw.withOne, csrfProtection, addCsrfGlobal, clientMw.checkIfEmailRequired, authTwoFactor.index);
    app.post('/auth/two-factor', clientMw.withOne, csrfProtection, addCsrfGlobal, authTwoFactor.post);
    app.get('/auth/two-factor/configure', clientMw.withOne, csrfProtection, addCsrfGlobal, clientMw.checkIfEmailRequired, authTwoFactor.configure);
    app.post('/auth/two-factor/configure', clientMw.withOne, csrfProtection, addCsrfGlobal, authTwoFactor.configurePost);

    app.use('/dialog', [bruteForce.global]);

    app.get('/dialog/authorize', clientMw.withOne, authMw.check, userMw.withRoleForClient, clientMw.checkRequiredUserFields, clientMw.check2FA, clientMw.checkPhonenumberAuth(), clientMw.checkUniqueCodeAuth((req, res) => {
        return res.redirect('/login?clientId=' + req.query.client_id);
    }), oauth2Controller.authorization);

    app.post('/dialog/authorize/decision', clientMw.withOne, userMw.withRoleForClient, clientMw.checkPhonenumberAuth(), clientMw.checkUniqueCodeAuth(),clientMw.check2FA, bruteForce.global, oauth2Controller.decision);
    app.post('/oauth/token', oauth2Controller.token);
    app.get('/oauth/token', oauth2Controller.token);

    app.get('/api/userinfo', passport.authenticate('bearer', {session: false}), clientMw.withOne, userMw.withRoleForClient, clientMw.checkIfAccessTokenBelongToCurrentClient, clientMw.checkPhonenumberAuth(), clientMw.checkUniqueCodeAuth(), userController.info);

    // Mimicking google's token info endpoint from
    // https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
    app.get('/api/tokeninfo', tokenController.info);

    // Mimicking google's token revoke endpoint from
    // https://developers.google.com/identity/protocols/OAuth2WebServer
    app.get('/api/revoke', tokenController.revoke);

    require('./adminApi')(app);

    // Handle 404
    app.use(function (req, res) {
        res.status(404).render('errors/404');
    });

    // Handle 500
    app.use(async function (err, req, res, next) {
        console.log('===> err', err);
        // een deserialize error betekent een data fout; daar hoef je een gebruiker niet mee te belasten
        if (err && err.message && err.message.match(/^Error in deserializeUser/)) {
          console.log(err); // do log for debugging
          await req.session.destroy();
          let querystring = '?'
          if (req.query.clientId) querystring += `&clientId=${req.query.clientId}`;
          if (req.query.client_id) querystring += `&client_id=${req.query.client_id}`;
          if (req.query.redirectUrl) querystring += `&redirectUrl=${encodeURIComponent(req.query.redirectUrl)}`;
          if (req.query.redirect_uri) querystring += `&redirect_uri=${encodeURIComponent(req.query.redirect_uri)}`;
          if (req.query.token) querystring += `&token=${req.query.token}`;
          if (req.query.access_token) querystring += `&access_token=${req.query.access_token}`;
          return res.redirect('/logout'+querystring);
        }
        res.status(500).render('errors/500');
    });

}
