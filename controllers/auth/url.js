/**
 * Controller responsible for handling the logic for Url login
 * (login in with a link, mainly send by e-mail)
 */


 exports.registerWithToken = (req, res, next) => {
   res.render('auth/register-with-token', {
     token: req.query.token,
     user: req.user,
     client: req.client
   });
 }

 exports.postRegisterWithToken = (req, res, next) => {
   const { firstName, lastName, postcode, token } = req.body;
   const userModel = req.userModel;

   /**
    * Set Values for user; validation is taken care of in middleware
    */
   userModel.set('firstName', firstName);
   userModel.set('lastName', lastName);
   userModel.set('postcode', postcode);

   /**
    * After succesfull registration redirect to token login url, for automagic login
    */
   userModel
   .save()
   .then((userReponse) => {
     const user = userReponse.serialize();
     res.redirect(tokenUrl.getUrl(user, req.client, token));
   })
   .catch((err) => { next(err) });

 };


 exports.loginWithToken =  (req, res, next) => {
   passport.authenticate('url', function(err, user, info) {
     if (err) { return next(err); }
     // Redirect if it fails
     console.log('====> user 1', user);

     if (!user) {
       console.log('====> user 5', user);

       return res.redirect(`/login-with-email-url?clientId=${req.client.clientId}`);
     }

     req.logIn(user, function(err) {
       if (err) { return next(err); }

       // Redirect if it succeeds
       const authorizeUrl = `/dialog/authorize?redirect_uri=${req.client.redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
     //  const authorizeUrl = '/account';
       return res.redirect(authorizeUrl);
     });
   })(req, res, next);
 };
