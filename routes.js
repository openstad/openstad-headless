const login                    = require('connect-ensure-login');
const oauth2Controller         = require('./controllers/oauth2');
const tokenController          = require('./controllers/token');
const authController           = require('./controllers/auth');
const userController           = require('./controllers/user');
const adminUserController      = require('./controllers/adminUser');
const adminClientController    = require('./controllers/adminClient');
const ExpressBrute 					   = require('express-brute');

const adminMiddleware          = require('./middleware/admin');
const clientMw      				   = require('./middleware/client');
const userMw           				 = require('./middleware/user');
const tokenMw                  = require('./middleware/token');

const bruteForce = new ExpressBrute(new ExpressBrute.MemoryStore(), {
	freeRetries  : 10,
	minWait      : 5000,
	maxWait      : 900000, // 15 min
	lifetime     : 86400, // 24 hours
	failCallback : function( req, res, next, nextValidRequestDate ) {
		var retryAfter = Math.ceil((nextValidRequestDate.getTime() - Date.now())/1000);
		res.header('Retry-After', retryAfter);
		res.locals.nextValidRequestDate = nextValidRequestDate;
		res.locals.retryAfter           = retryAfter;
		next(createError(429, {nextValidRequestDate: nextValidRequestDate}));
	}
});

module.exports = function(app){
  app.get('/', authController.index);
  app.get('/login', authController.login);
  app.get('/login-with-token', bruteForce.prevent, clientMw.withOne, authController.loginWithToken);
	app.get('/register-with-token', tokenMw.addUser, clientMw.withOne, authController.registerWithToken);
  //app.post('/login-with-token', bruteForce.prevent, ByPublicId, authController.postLoginOrRegisterWithEmailUrl);
	app.post('/register-with-token', bruteForce.prevent, tokenMw.addUser, userMw.validateUser, clientMw.withOne, authController.postRegisterWithToken);

  app.get('/register', authController.register);
  app.get('/forgot', authController.forgot);
  app.get('/reset', authController.reset);

  app.get('/logout', authController.logout);
  app.get('/account', login.ensureLoggedIn(), userController.account);
  app.post('/account', login.ensureLoggedIn(), userMw.validateUser, userController.postAccount);
  app.post('/password', login.ensureLoggedIn(), userMw.validatePassword, userController.postAccount);


  app.post('/login', bruteForce.prevent, authController.postLogin);
  app.post('/register', bruteForce.prevent, userMw.validateUser, authController.postRegister);
  app.post('/forgot', bruteForce.prevent, authController.postForgot);
  app.post('/reset', bruteForce.prevent, authController.postReset);

  app.get('/dialog/authorize', oauth2Controller.authorization);
  app.post('/dialog/authorize/decision', bruteForce.prevent, oauth2Controller.decision);
  app.post('/oauth/token', bruteForce.prevent, oauth2Controller.token);
  app.get('/oauth/token', oauth2Controller.token);

  app.get('/api/userinfo', userController.info);
  // app.get('/api/clientinfo', client.info);

  // Mimicking google's token info endpoint from
  // https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
  app.get('/api/tokeninfo', tokenController.info);

  // Mimicking google's token revoke endpoint from
  // https://developers.google.com/identity/protocols/OAuth2WebServer
  app.get('/api/revoke', tokenController.revoke);

  /**
   * Admin user routes
   */
  app.get('/admin/users', adminMiddleware.ensure, userMw.withAll, adminUserController.all);
  app.get('/admin/user/:userId', adminMiddleware.ensure, userMw.withOne, adminUserController.edit);
  app.get('/admin/user', adminMiddleware.ensure, adminUserController.new);
  app.post('/admin/user', adminMiddleware.ensure, adminUserController.create);
  app.post('/admin/user/:userId', adminMiddleware.ensure, userMw.withOne, adminUserController.update);

  /**
   * Admin client routes
   */
  app.get('/admin/clients', adminMiddleware.ensure, clientMw.withAll, adminClientController.all);
  app.get('/admin/client/:clientId', adminMiddleware.ensure, clientMw.withOne, adminClientController.edit);
  app.get('/admin/client', adminMiddleware.ensure, adminClientController.new);
  app.post('/admin/client', adminMiddleware.ensure, adminClientController.create);
  app.post('/admin/client/:clientId', adminMiddleware.ensure, clientMw.withOne, adminClientController.update);
}
