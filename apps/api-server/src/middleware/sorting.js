const db = require('../db');

const allowedSortColumns = Object.entries(db.Resource.getAttributes())
  .filter(([key, val]) => !(val.type instanceof db.Sequelize.DataTypes.VIRTUAL))
  .map(([key]) => key);

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
          
          // For incorrect sort columns, return by rank
          let match = column.match(/^([a-z0-9_]+)_(asc|desc)$/i);
          if (!match) {
            return [ 'yes', 'DESC' ];
            break;
          }
          
          // If the column is not allowed, return by rank
          if (!allowedSortColumns.includes(match[0])) {
            return [ 'yes', 'DESC' ];
            break;
          }
          
          const sortOrder = column.endsWith('_asc') ? 'ASC' : 'DESC';
          
          return [ match[0], sortOrder ];
      }
    });
    req.dbQuery.order = sort;
  }
  return next();
}
1
