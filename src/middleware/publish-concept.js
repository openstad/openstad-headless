module.exports = function( req, res, next ) {
    if(!req.body.publishAsConcept) {
        req.body['publishDate'] = new Date();
      } else {
        req.body['publishDate'] = null;
      }
      return next();
}