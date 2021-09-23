/**
 * Get the correct clientId from the passed request
 *
 * @param req
 * @returns {boolean|*}
 */
module.exports = (req) => {
  
  if (!req) {
    return false;
  }
  
  let clientId = req.body && req.body.clientId ? req.body.clientId : req.query.clientId;
  
  if (!clientId) {
      clientId = req.query.client_id;
  }

  if (!clientId) {
      clientId = req.params.clientId;
  }
  
  return clientId;
}
