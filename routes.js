const oauth2Controller         = require('./controllers/oauth2');
const tokenController          = require('./controllers/token');
const authController           = require('./controllers/auth');
const adminUserController      = require('./controllers/adminUser');
const adminClientController    = require('./controllers/adminClient');
const adminMiddleware          = require('./middleware/admin');
const clientMiddleware         = require('./middleware/admin');
const userMiddleware           = require('./middleware/admin');

//login.ensureLoggedIn();

module.exports = function(app){
  app.get('/', authController.index);
  app.get('/login', authController.loginForm);
  app.post('/login', authController.login);
  app.get('/logout', authController.logout);
  app.get('/account', authController.account);

  app.get('/dialog/authorize', oauth2Controller.authorization);
  app.post('/dialog/authorize/decision', oauth2Controller.decision);
  app.post('/oauth/token', oauth2Controller.token);

  app.get('/api/userinfo',   user.info);
  // app.get('/api/clientinfo', client.info);

  // Mimicking google's token info endpoint from
  // https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
  app.get('/api/tokeninfo', token.info);

  // Mimicking google's token revoke endpoint from
  // https://developers.google.com/identity/protocols/OAuth2WebServer
  app.get('/api/revoke', token.revoke);

  /**
   * Admin user routes
   */
  app.get('/admin/users', adminMiddleware.ensure, userMiddleware.withAll, adminUserController.all);
  app.get('/admin/user/:userId', adminMiddleware.ensure, userMiddleware.withOne, adminUserController.edit);
  app.get('/admin/user', adminMiddleware.ensure, adminUserController.new);
  app.post('/admin/user', adminMiddleware.ensure, adminUserController.create);
  app.post('/admin/user/:userId', adminMiddleware.ensure, userMiddleware.withOne, adminUserController.update);

  /**
   * Admin client routes
   */
  app.get('/admin/clients', adminMiddleware.ensure, clientMiddleware.withAll, adminClientController.all);
  app.get('/admin/client/:clientId', adminMiddleware.ensure, clientMiddleware.withOne, adminClientController.edit);
  app.get('/admin/client', adminMiddleware.ensure, adminClientController.new);
  app.post('/admin/client', adminMiddleware.ensure, adminUserController.create);
  app.post('/admin/client/:clientId', adminMiddleware.ensure, clientMiddleware.withOne, adminUserController.update);

  // static resources for stylesheets, images, javascript files
  app.use(express.static(path.join(__dirname, 'public')));
}
