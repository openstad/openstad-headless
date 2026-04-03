const crypto = require('crypto');
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
        case 'votes_asc':
          return ['yes', 'ASC'];
        case 'random':
          const clientSeed = parseInt(req.query.pseudoRandomSortSeed, 10);
          const seed = Number.isInteger(clientSeed)
            ? clientSeed
            : crypto.randomInt(4294967295);
          return db.sequelize.literal(`RAND(${seed})`);
        case 'score':
          if (!allowedSortColumns.includes('score')) {
            return [fallbackSortColumn, 'DESC'];
          }
          return ['score', 'DESC'];
        case 'title':
          if (!allowedSortColumns.includes('title')) {
            return [fallbackSortColumn, 'DESC'];
          }
          return ['title', 'ASC'];
        default:
          column = column.replace(/[^a-z0-9_]+/gi, '');

          let match = column.match(/^([a-z0-9_]+)_(asc|desc)$/i);
          if (!match) {
            return [fallbackSortColumn, 'DESC'];
          }

          if (!allowedSortColumns.includes(match[1])) {
            return [fallbackSortColumn, 'DESC'];
          }

          const sortOrder = column.endsWith('_asc') ? 'ASC' : 'DESC';

          return [match[1], sortOrder];
      }
    });
    req.dbQuery.order = sort;
  }
  return next();
};
