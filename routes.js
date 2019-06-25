const multer                   = require('multer');
//const upload                   = multer({ dest: 'uploads/' });
const upload                   = multer();
const passport                 = require('passport');

//CONTROLERS
const oauth2Controller 				 = require('./controllers/oauth/oauth2');
const tokenController          = require('./controllers/oauth/token');
const userController           = require('./controllers/user/user');
const adminUserController      = require('./controllers/admin/user');
const adminClientController    = require('./controllers/admin/client');
const adminRoleController      = require('./controllers/admin/role');
const adminCodeController      = require('./controllers/admin/code');

const adminApiUserController          = require('./controllers/admin/api/user');
const adminApiClientController        = require('./controllers/admin/api/client');
const adminApiRoleController          = require('./controllers/admin/api/role');
const adminApiUniqueCodeController    = require('./controllers/admin/api/uniqueCode');


//AUTH CONTROLLERS
const authChoose	 						 = require('./controllers/auth/choose');
const authUrl 		 						 = require('./controllers/auth/url');
const authForgot							 = require('./controllers/auth/forgot');
const authDigiD							 	 = require('./controllers/auth/digid');
const authLocal							   = require('./controllers/auth/local');
const authCode							 	 = require('./controllers/auth/code');
const authRequiredFields	     = require('./controllers/auth/required');

//MIDDLEWARE
const adminMiddleware          = require('./middleware/admin');
const clientMw      				   = require('./middleware/client');
const userMw           				 = require('./middleware/user');
const tokenMw                  = require('./middleware/token');
const bruteForce 							 = require('./middleware/bruteForce');
const authMw                   = require('./middleware/auth');
const passwordResetMw          = require('./middleware/passwordReset');
const roleMw                   = require('./middleware/role');
const codeMw                   = require('./middleware/code');
const logMw                    = require('./middleware/log');


const loginBruteForce = bruteForce.user.getMiddleware({
  key: function(req, res, next) {
      // prevent too many attempts for the same username
      next(req.body.email);
  }
});

const uniqueCodeBruteForce = bruteForce.user.getMiddleware({
  key: function(req, res, next) {
      // prevent too many attempts for the same username
      next('unique_code');
  }
});

const emailUrlBruteForce = bruteForce.user.getMiddleware({
  key: function(req, res, next) {
      // prevent too many attempts for the same username
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
	app.post('/auth/url/login',         emailUrlBruteForce, authUrl.postLogin);
  app.get('/auth/url/authenticate',   authUrl.authenticate);
	app.post('/auth/url/authenticate',   emailUrlBruteForce, authUrl.postAuthenticate);
	//app.get('/auth/url/register',      authUrl.register);
	//app.post('/auth/url/register',     authUrl.postRegister);

	/**
	 * Auth routes for DigiD
	 * @TODO: available routes
	 */
	app.use('/auth/digid', [clientMw.setAuthType('DigiD'), clientMw.validate, csrfProtection, addCsrfGlobal]);
 	app.get('/auth/digid/login',  clientMw.withOne, authDigiD.login);
  app.post('/auth/digid/login', clientMw.withOne, authDigiD.postLogin);

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
//	app.get('/register/info')

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
  app.get('/auth/required-fields', authRequiredFields.index);
  app.post('/auth/required-fields', clientMw.withOne, authRequiredFields.post);


  app.use('/dialog', [bruteForce.global.prevent]);

  app.get('/dialog/authorize',            clientMw.withOne, authMw.check, clientMw.checkRequiredUserFields,  clientMw.checkUniqueCodeAuth((req, res) => { return res.redirect('/login?clientId=' + req.query.client_id);}), oauth2Controller.authorization);
  app.post('/dialog/authorize/decision',  clientMw.withOne, clientMw.checkUniqueCodeAuth(), bruteForce.global.prevent, oauth2Controller.decision);
  app.post('/oauth/token',                oauth2Controller.token);
  app.get('/oauth/token',                 oauth2Controller.token);
//   clientMw.withOne,
//clientMw.withOne, bruteForce.global.prevent,


//
  app.get('/api/userinfo', passport.authenticate('bearer', { session: false }), clientMw.withOne, clientMw.checkUniqueCodeAuth(), userMw.withRoleForClient, userController.info);
  //app.get('/api/clientinfo', client.info);

  // Mimicking google's token info endpoint from
  // https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
  app.get('/api/tokeninfo', tokenController.info);

  // Mimicking google's token revoke endpoint from
  // https://developers.google.com/identity/protocols/OAuth2WebServer
  app.get('/api/revoke', tokenController.revoke);

  /**
   * Admin user routes
   */

  //shared middlware for all admin routes
  app.use('/admin', [adminMiddleware.addClient, authMw.check, userMw.withRoleForClient, adminMiddleware.ensure]);

  app.get('/admin/users',         userMw.withAll, adminUserController.all);
  app.get('/admin/user/:userId',  clientMw.withAll, roleMw.withAll, userMw.withOne, adminUserController.edit);
  app.get('/admin/user',          clientMw.withAll, roleMw.withAll, adminUserController.new);
  app.post('/admin/user',         adminUserController.create);
  app.post('/admin/user/:userId', userMw.withOne, adminUserController.update);


  require('./routes/adminApi')(app);


  /**
   * Admin client routes
   */
  app.get('/admin/clients',           clientMw.withAll, adminClientController.all);
  app.get('/admin/client/:clientId',  clientMw.withOneById, adminClientController.edit);
  app.get('/admin/client',            adminClientController.new);
  app.post('/admin/client',           adminClientController.create);
  app.post('/admin/client/:clientId', clientMw.withOneById, adminClientController.update);

  /**
   * Admin role routes
   */
  app.get('/admin/roles',           roleMw.withAll, adminRoleController.all);
  app.get('/admin/role/:roleId',    roleMw.withOne, adminRoleController.edit);
  app.get('/admin/role',            adminRoleController.new);
  app.post('/admin/role',           adminRoleController.create);
  app.post('/admin/role/:roleId',   roleMw.withOne, adminRoleController.update);

  /**
   * Admin code routes
   */
  app.get('/admin/codes',                   codeMw.withAll, adminCodeController.all);
  app.get('/admin/code',                    clientMw.withAll, adminCodeController.new);
  app.get('/admin/code/bulk',               clientMw.withAll, adminCodeController.bulk);
  app.post('/admin/code/bulk',              upload.single('file'),  adminCodeController.postBulk);
  app.post('/admin/code',                   adminCodeController.create);
  app.post('/admin/code/destroy/:codeId',   adminCodeController.destroy);

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
