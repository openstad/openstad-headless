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
  
  let clientId = req.body && req.body.clientId;
  
  if (!clientId && req.query && req.query.clientId) {
    clientId = req.query.clientId;
  }
  
  if (!clientId && req.query && req.query.client_id) {
      clientId = req.query.client_id;
  }

  if (!clientId && req.params && req.params.clientId) {
      clientId = req.params.clientId;
  }
  
  return clientId;
}
