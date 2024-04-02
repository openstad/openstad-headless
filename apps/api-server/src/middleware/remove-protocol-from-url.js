module.exports = function(req, res, next) {
  if ( !req.body || !req.body.url ) return next();
  
  const protocolRegex = /(^\w+:|^)\/\//;
  
  // Check if url has protocol
  if (!!req.body.url.match(protocolRegex)) {
    // Remove protocol from url
    req.body.url = req.body.url.replace(protocolRegex, '');
  }
  
  return next();
}
