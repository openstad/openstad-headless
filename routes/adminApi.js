const passport                 = require('passport');

const adminApiUserController          = require('../controllers/admin/api/user');
const adminApiClientController        = require('../controllers/admin/api/client');
const adminApiRoleController          = require('../controllers/admin/api/role');
const adminApiUniqueCodeController    = require('../controllers/admin/api/uniqueCode');

//MIDDLEWARE
const adminMiddleware          = require('../middleware/admin');
const clientMw      				   = require('../middleware/client');
const userMw           				 = require('../middleware/user');
const tokenMw                  = require('../middleware/token');
const bruteForce 							 = require('../middleware/bruteForce');
const authMw                   = require('../middleware/auth');
const passwordResetMw          = require('../middleware/passwordReset');
const roleMw                   = require('../middleware/role');
const codeMw                   = require('../middleware/code');
const logMw                    = require('../middleware/log');

module.exports = (app) => {
  app.use('/api/admin', [passport.authenticate(['basic', 'oauth2-client-password'], { session: false })]);

  /**
   *  Simple CRUD API for users
   */
  app.get('/api/admin/users',                 userMw.withAll, adminApiUserController.all);
  app.get('/api/admin/user/:userId',          clientMw.withAll, roleMw.withAll, userMw.withOne, adminApiUserController.show);
  app.post('/api/admin/user',                 userMw.create, userMw.saveRoles, adminApiUserController.create);
  app.post('/api/admin/user/:userId',         userMw.withOne, userMw.update, userMw.saveRoles, adminApiUserController.update);
  app.post('/api/admin/user/:userId/delete',  userMw.withOne, userMw.deleteOne, adminApiUserController.delete);



  /**
   *  Simple CRUD API for clients
   */
  app.get('/api/admin/clients',                     clientMw.withAll, adminApiClientController.all);
  app.get('/api/admin/client/:clientId',            clientMw.withOne, adminApiClientController.show);
  app.post('/api/admin/client',                     clientMw.create,  adminApiClientController.create);
  app.post('/api/admin/client/:clientId',           clientMw.withOne, clientMw.update, adminApiClientController.update);
  app.post('/api/admin/client/:clientId/delete',    clientMw.withOne, clientMw.deleteOne, adminApiClientController.delete);

  /**
   *  GET all roles API, only reading allowed
   */
  app.get('/api/admin/roles',                       roleMw.withAll, adminApiRoleController.all);

  /**
   * Simple CRUD + more api API
   */
  app.get('/api/admin/unique-codes',                  clientMw.withOne,   codeMw.withAll,   adminApiUniqueCodeController.all);
  app.get('/api/admin/unique-code/:codeId',           codeMw.withOne,     adminApiUniqueCodeController.show);
  app.post('/api/admin/unique-code',                  clientMw.withOne,   codeMw.create,    adminApiUniqueCodeController.created);
  app.post('/api/admin/unique-code/:codeId/delete',   codeMw.deleteOne,   adminApiUniqueCodeController.delete);
  app.post('/api/admin/unique-code/:codeId/reset',    codeMw.withOne,     codeMw.reset, adminApiUniqueCodeController.reset);

  // only use this error handler middleware in "/api" based routes in order to output the errors as JSON instead of HTML
  app.use("/api/admin/", function(err, req, res, next){
    console.log('===> err', err);

    // use the error's status or default to 500
    res.status(err.status || 500);

    // send back json data
    res.send({
      message: err.message
    })
  });
}
