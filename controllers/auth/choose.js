/**
 * Controller responsible for handling the logic for choosing which login options are availablde
 * (standard login with password & register)
 */

 /**
  * If one available auth type is available, redirect otherwise let the user choose
  */
 exports.index = (req, res, next) => {
   const availableAuthTypes = req.client.getAuthTypes();

   if (availableAuthTypes.length === 1) {
     let availableAuthType = availableAuthTypes.shift();
     res.redirect(availableAuthType.loginUrl);
   } else {
     res.render('auth/choose', {
        authTypes: availableAuthTypes
     })
   }
 };
