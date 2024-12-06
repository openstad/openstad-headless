const db = require('../db');

module.exports = function( req, res, next ) {
  let sort = req.query.sort;
  if (sort) {
    if (!Array.isArray(sort)) sort = [ sort ];
    sort = sort.map( column => {
      switch (column) {
        case 'votes_desc':
        case 'ranking':
          return [ 'yes', 'DESC' ];
          break;
        case 'votes_asc':
          return [ 'yes', 'ASC' ];
          break;
        // case 'comments_desc':
        //   return [ 'commentCount', 'DESC' ];
        //   break;
        // case 'comments_asc':
        //   return [ 'commentCount', 'ASC' ];
        //   break;
        case 'random':
          return db.sequelize.random();
          break;
        default:
          column = column.replace(/[^a-z0-9_]+/ig, '');
          let match = column.match(/(.*?)_(asc|desc)$/i);
          if (match) return [ match[1], match[2] ];
          return column
      }
    });
    req.dbQuery.order = sort;
  }
  return next();
}
1
