/**
 * Controller responsible for handling the logic for choosing which login options are availablde
 * (standard login with password & register)
 */

 /**
  * If one available auth type is available, redirect otherwise let the user choose
  */
 exports.index = (req, res, next) => {
   const availableAuthTypes = req.clientModel.getAuthTypes(req.clientModel);

   if (availableAuthTypes.length === 1) {
     let availableAuthType = availableAuthTypes.shift();
     let url = availableAuthType.loginUrl + '?clientId=' + req.client.clientId;
     
     if (req.query.redirect_uri) {
       url =  url + '&redirect_uri=' + req.query.redirect_uri;
     }

     res.redirect(url);
   } else {
     res.render('auth/choose', {
        authTypes: availableAuthTypes,
        clientId: req.client.clientId,
        client: req.client,
        redirect_uri: req.query.redirect_uri
     })
   }
 };
