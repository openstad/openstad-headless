module.exports = function( req, res, next ) {
  let sort = req.query.sort;
  if (sort) {
    if (!Array.isArray(sort)) sort = [ sort ];
    sort = sort.map( column => {
      column = column.replace(/[^a-z0-9_]+/ig, '');
      let match = column.match(/(.*?)_(asc|desc)$/i);
      if (match) return [ match[1], match[2] ];
      return column
    });
    req.dbQuery.order = sort;
  }
  return next();
}
