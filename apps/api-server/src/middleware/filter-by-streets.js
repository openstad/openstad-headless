const createError = require('http-errors');

const {
  matchesStreets,
  parseStreetsParam,
} = require('../lib/resource-streets');

module.exports = function filterByStreets(req, res, next) {
  if (typeof req.query.streets === 'undefined') return next();
  const streets = parseStreetsParam(req.query.streets);
  if (!streets) return next(createError(400, 'Ongeldige straten opgegeven'));
  if (streets.length === 0) return next();
  req.results = req.results.filter((resource) =>
    matchesStreets(resource, streets)
  );
  if (req.dbQuery) req.dbQuery.count = req.results.length;
  return next();
};
