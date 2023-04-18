const adminAuthTypes = require('../../config/auth').adminTypes;
const configAuthTypes = require('../../config/auth.js').types;

/**
 * Controller responsible for handling the logic for choosing which login options are availablde
 * (standard login with password & register)
 */

 /**
  * If one available auth type is available, redirect otherwise let the user choose
  */
 exports.index = (req, res, next) => {
   let isPriviligedRoute = false;
   let availableAuthTypes;
   if (req.params.priviligedRoute) {
     isPriviligedRoute = true;
     availableAuthTypes = adminAuthTypes;
   } else {
     availableAuthTypes = req.client.authTypes || [];
     availableAuthTypes = availableAuthTypes.map((authType) => {
       let configAuthType = configAuthTypes.find(type => type.key === authType);
       return configAuthType;
     });
   }

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
