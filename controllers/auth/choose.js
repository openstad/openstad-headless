const adminAuthTypes = require('../../config/auth').adminTypes;
/**
 * Controller responsible for handling the logic for choosing which login options are availablde
 * (standard login with password & register)
 */

 /**
  * If one available auth type is available, redirect otherwise let the user choose
  */
 exports.index = (req, res, next) => {
   const isPriviligedRoute = req.params.priviligedRoute === 'admin';
   const availableAuthTypes = isPriviligedRoute ? adminAuthTypes : req.clientModel.getAuthTypes(req.clientModel);

   if (availableAuthTypes.length === 1) {
     let availableAuthType = availableAuthTypes.shift();
     let url = availableAuthType.loginUrl + '?clientId=' + req.client.clientId;
     
     if (req.query.redirect_uri) {
       url =  url + '&redirect_uri=' + encodeURIComponent(req.query.redirect_uri);
     }

     res.redirect(url);
   } else {
     res.render('auth/choose', {
        authTypes: availableAuthTypes,
        isPriviligedRoute: isPriviligedRoute,
        clientId: req.client.clientId,
        client: req.client,
        redirect_uri: encodeURIComponent(req.query.redirect_uri)
     })
   }
 };
