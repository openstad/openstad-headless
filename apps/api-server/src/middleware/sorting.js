const db = require('../db');

function getSortableModel(req) {
  const url = `${req.baseUrl || ''}${req.path || ''}`;

  if (/\/user(\/|$)/.test(url)) return db.User;
  if (/\/comment(\/|$)/.test(url)) return db.Comment;
  if (/\/vote(\/|$)/.test(url)) return db.Vote;
  if (/\/choicesguide(\/|$)/.test(url)) return db.ChoicesGuideResult;
  if (/\/resource(\/|$)/.test(url)) return db.Resource;

  return db.Resource;
}

function getAllowedSortColumns(req) {
  const model = getSortableModel(req);
  const modelColumns = Object.entries(model.getAttributes())
    .filter(([, val]) => !(val.type instanceof db.Sequelize.DataTypes.VIRTUAL))
    .map(([key]) => key);

  // These can be projected through includeVoteCount scopes and are valid
  // sort targets on resource/comment lists.
  if (model === db.Resource || model === db.Comment) {
    modelColumns.push('yes', 'no');
  }

  return modelColumns;
}

function getFallbackSortColumn(req) {
  const allowedColumns = getAllowedSortColumns(req);
  if (allowedColumns.includes('createdAt')) return 'createdAt';
  if (allowedColumns.includes('id')) return 'id';
  return allowedColumns[0] || 'id';
}

module.exports = function (req, res, next) {
  let sort = req.query.sort;
  const allowedSortColumns = getAllowedSortColumns(req);
  const fallbackSortColumn = getFallbackSortColumn(req);

  if (sort) {
    if (!Array.isArray(sort)) sort = [sort];
    sort = sort.map((column) => {
      switch (column) {
        case 'votes_desc':
        case 'ranking':
          return ['yes', 'DESC'];
          break;
        case 'votes_asc':
          return ['yes', 'ASC'];
          break;
        case 'random':
          const rotationMs =
            parseInt(process.env.RANDOM_SORT_ROTATION_MS, 10) || 0;
          const seed =
            rotationMs > 0 ? Math.floor(Date.now() / rotationMs) : 12345;
          return db.sequelize.literal(`RAND(${seed})`);
          break;
        case 'score':
          if (!allowedSortColumns.includes('score')) {
            return [fallbackSortColumn, 'DESC'];
          }
          return ['score', 'DESC'];
          break;
        case 'title':
          if (!allowedSortColumns.includes('title')) {
            return [fallbackSortColumn, 'DESC'];
          }
          return ['title', 'ASC'];
          break;
        default:
          column = column.replace(/[^a-z0-9_]+/gi, '');

          let match = column.match(/^([a-z0-9_]+)_(asc|desc)$/i);
          if (!match) {
            return [fallbackSortColumn, 'DESC'];
            break;
          }

          if (!allowedSortColumns.includes(match[1])) {
            return [fallbackSortColumn, 'DESC'];
            break;
          }

          const sortOrder = column.endsWith('_asc') ? 'ASC' : 'DESC';

          return [match[1], sortOrder];
      }
    });
    req.dbQuery.order = sort;
  }
  return next();
};
