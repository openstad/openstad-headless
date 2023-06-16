module.exports = function oidcMiddleware(req, res, next) {
  console.log('OIDCMIDDLEWARE');
  return next();
}
