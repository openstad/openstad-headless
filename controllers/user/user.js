const login     = require('connect-ensure-login');
const User      = require('../../models').User;


/**
 * Simple informational end point, if you want to get information
 * about a particular user.  You would call this with an access token
 * in the body of the message according to OAuth 2.0 standards
 * http://tools.ietf.org/html/rfc6750#section-2.1
 *
 * Example would be using the endpoint of
 * https://localhost:3000/api/userinfo
 *
 * With a GET using an Authorization Bearer token similar to
 * GET /api/userinfo
 * Host: https://localhost:3000
 * Authorization: Bearer someAccessTokenHere
 * @param {Object} req The request
 * @param {Object} res The response
 * @returns {undefined}
 */
exports.info = (req, res) => {
  // req.authInfo is set using the `info` argument supplied by
  // `BearerStrategy`.  It is typically used to indicate scope of the token,
  // and used in access control checks.  For illustrative purposes, this
  // example simply returns the scope in the response.

  res.json({
    user_id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    scope: req.authInfo.scope
  });
}


/**
 * Render account.html but ensure the user is logged in before rendering
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
 exports.account = [
   login.ensureLoggedIn(),
   (req, res) => {
     res.render('account/profile', {
       user: req.user
     });
   }
 ];

 exports.postAccount = [
   (req, res) => {
     const keysToUpdate = ['firstName', 'lastName', 'email', 'street_name', 'house_number', 'suffix', 'postcode', 'city', 'phone']

     new User({ id: req.user.id })
       .fetch()
       .then((user) => {
         keysToUpdate.forEach((key) => {
           if (req.body[key]) {
             user.set(key, req.body[key]);
           }
         });

         // Save user and redirect back
         user
           .save()
           .then(() => { req.flash('success', { msg: 'Opgeslagen' }); res.redirect('/account'); })
           .catch((err) => { next(err); })
       });
   }
 ];

 exports.postPassword = (req, res, next) => {
   new User({id: req.user.id})
     .fetch()
     .then((user) => {
       user.set('password', bcrypt.hashSync(req.body.password, saltRounds));

       user
         .save()
         .then(() => {
           req.flash('success', { msg: 'Wachtwoord aangepast, je kan nu inloggen!' });
           res.redirect(authLocalConfig.loginUrl);
         })
         .catch((err) => {
           next(err);
         })
     });
 };
