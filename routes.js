const passport                 = require('passport');

//CONTROLERS
const oauth2Controller 				 = require('./controllers/oauth/oauth2');
const tokenController          = require('./controllers/oauth/token');
const userController           = require('./controllers/user/user');

//AUTH CONTROLLERS
const authChoose	 						 = require('./controllers/auth/choose');
const authUrl 		 						 = require('./controllers/auth/url');
const authAdminUrl 		 				 = require('./controllers/auth/adminUrl');
const authForgot							 = require('./controllers/auth/forgot');
const authDigiD							 	 = require('./controllers/auth/digid');
const authAnonymous					 	 = require('./controllers/auth/anonymous');
const authLocal							   = require('./controllers/auth/local');
const authCode							 	 = require('./controllers/auth/code');
const authRequiredFields	     = require('./controllers/auth/required');

//MIDDLEWARE
const clientMw      				   = require('./middleware/client');
const userMw           				 = require('./middleware/user');
const bruteForce 							 = require('./middleware/bruteForce');
const authMw                   = require('./middleware/auth');
const passwordResetMw          = require('./middleware/passwordReset');
const logMw                    = require('./middleware/log');


const loginBruteForce = bruteForce.user.getMiddleware({
  key: function(req, res, next) {
      // prevent too many attempts for the same email
      next(req.body.email);
  }
});

const uniqueCodeBruteForce = bruteForce.user.getMiddleware({
  key: function(req, res, next) {
      // prevent too many attempts for the same unique_code
      next('unique_code');
  }
});

const emailUrlBruteForce = bruteForce.user.getMiddleware({
  key: function(req, res, next) {
      // prevent too many attempts for the same email
      next(req.body.email);
  }
});

const csurf = require('csurf');

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE_OFF === 'yes' ? false : true,
    sameSite: true
  }
});

const addCsrfGlobal = (req, res, next) => {
  req.nunjucksEnv.addGlobal('csrfToken', req.csrfToken());
  next();
};

module.exports = function(app){
  app.use(function(req, res, next) {
    next();
  });

  app.get('/', authLocal.index);


	/**
	 * Login routes for clients,
	 * checks if one or more options of authentications is available
	 * and either shows choice or redirects if one option
	 */
	app.get('/login', clientMw.withOne, authChoose.index);

	/**
	 * Shared middleware for all auth routes, adding client and per
	 */
	app.use('/auth', [clientMw.withOne, bruteForce.global.prevent]);

	/**
	 * Login & register with local login
	 */
	//shared middleware
	app.use('/auth/local', [clientMw.setAuthType('Local'), clientMw.validate, csrfProtection, addCsrfGlobal]);

	//routes
	app.get('/auth/local/login',     authLocal.login);
	app.post('/auth/local/login',    loginBruteForce, authMw.validateLogin, authLocal.postLogin);
	app.get('/auth/local/register',  authLocal.register);
	app.post('/auth/local/register', userMw.validateUser, userMw.validateUniqueEmail, authLocal.postRegister);

	/**
	 * Deal with forgot password
	 */
	app.get('/auth/local/forgot',    authForgot.forgot);
	app.post('/auth/local/forgot',   authForgot.postForgot);
	app.get('/auth/local/reset',     passwordResetMw.validate, authForgot.reset);
	app.post('/auth/local/reset',    passwordResetMw.validate, authMw.passwordValidate, userMw.withOne, userMw.validatePassword, authForgot.postReset);

	/**
	 * Auth routes for URL login
	 */
	 // shared middleware
	app.use('/auth/url', [clientMw.setAuthType('Url'), clientMw.validate, csrfProtection, addCsrfGlobal]);

	// routes
	app.get('/auth/url/login',          authUrl.login);
  app.get('/auth/url/confirmation',   authUrl.confirmation);
	app.post('/auth/url/login',         emailUrlBruteForce, authUrl.postLogin);
  app.get('/auth/url/authenticate',   authUrl.authenticate);
	app.post('/auth/url/authenticate',   emailUrlBruteForce, authUrl.postAuthenticate);


	// Admin login routes
  app.use('/auth/admin', [csrfProtection, addCsrfGlobal]);

  app.get('/auth/admin/login', authUrl.login);
  app.get('/auth/admin/confirmation', authUrl.confirmation);
  app.post('/auth/admin/login', emailUrlBruteForce, authAdminUrl.postLogin);
  app.get('/auth/admin/authenticate', authUrl.authenticate);
  app.post('/auth/admin/authenticate', emailUrlBruteForce, authAdminUrl.postAuthenticate);

	/**
	 * Auth routes for DigiD
	 * @TODO: available routes
	 */
	app.use('/auth/digid', [clientMw.setAuthType('DigiD'), clientMw.validate, csrfProtection, addCsrfGlobal]);
 	app.get('/auth/digid/login',  clientMw.withOne, authDigiD.login);
  app.post('/auth/digid/login', clientMw.withOne, authDigiD.postLogin);

	/**
	 * Auth routes for Anonymous login
	 */
	 // shared middleware
	app.use('/auth/anonymous', [clientMw.withOne, clientMw.setAuthType('Anonymous'), clientMw.validate, csrfProtection, addCsrfGlobal]);

	// routes
	app.get('/auth/anonymous/info',  authAnonymous.info);
	app.get('/auth/anonymous/login',  authAnonymous.login);
	app.get('/auth/anonymous/register', authAnonymous.register);

	/**
	 * Auth routes for UniqueCode
	 */
	app.use('/auth/code', [clientMw.withOne, clientMw.setAuthType('UniqueCode'), clientMw.validate, csrfProtection, addCsrfGlobal]);
	app.get('/auth/code/login',  authCode.login);
	app.post('/auth/code/login', uniqueCodeBruteForce, logMw.logPostUniqueCode, authCode.postLogin);

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
	app.use('/user', [ clientMw.withOne, authMw.check]);
  app.get('/account',  clientMw.withOne, authMw.check, csrfProtection, addCsrfGlobal, userController.account);
  app.post('/account', clientMw.withOne, authMw.check, csrfProtection, addCsrfGlobal, userMw.validateUser, userController.postAccount);
  app.post('/password', clientMw.withOne, authMw.check, csrfProtection, addCsrfGlobal, userMw.validatePassword, userController.postAccount);

  app.use('/auth/required-fields', [authMw.check, clientMw.withOne]);
  app.get('/auth/required-fields',  clientMw.withOne, clientMw.checkIfEmailRequired, authRequiredFields.index);
  app.post('/auth/required-fields', clientMw.withOne, authRequiredFields.post);


  app.use('/dialog', [bruteForce.global.prevent]);

  app.get('/dialog/authorize',            clientMw.withOne, authMw.check, userMw.withRoleForClient, clientMw.checkRequiredUserFields,  clientMw.checkUniqueCodeAuth((req, res) => { return res.redirect('/login?clientId=' + req.query.client_id);}),   oauth2Controller.authorization);
  app.post('/dialog/authorize/decision',  clientMw.withOne, userMw.withRoleForClient, clientMw.checkUniqueCodeAuth(),  bruteForce.global.prevent, oauth2Controller.decision);
  app.post('/oauth/token',                oauth2Controller.token);
  app.get('/oauth/token',                 oauth2Controller.token);

  app.get('/api/userinfo', passport.authenticate('bearer', { session: false }), clientMw.withOne, userMw.withRoleForClient, clientMw.checkUniqueCodeAuth(), userController.info);
  //app.get('/api/clientinfo', client.info);

  // Mimicking google's token info endpoint from
  // https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
  app.get('/api/tokeninfo', tokenController.info);

  // Mimicking google's token revoke endpoint from
  // https://developers.google.com/identity/protocols/OAuth2WebServer
  app.get('/api/revoke', tokenController.revoke);

  require('./routes/adminApi')(app);

  /**
   * Error routes
   */

  // Handle 404
  app.use(function(req, res) {
     res.status(404).render('errors/404');
  });

  // Handle 500
  app.use(function(err, req, res, next) {
    console.log('===> err', err);
    res.status(500).render('errors/500');
  });
}
