const { Op } = require('sequelize');

function escapeLikeTerm(value) {
  return String(value).replace(/[\\%_]/g, (m) =>
    m === '\\' ? '\\\\' : '\\' + m
  );
}

function applyUserSearchFilter(where, q) {
  const term = typeof q === 'string' ? q.trim() : '';
  if (!term) return where;

  const like = '%' + escapeLikeTerm(term) + '%';
  const existing = Array.isArray(where[Op.and]) ? where[Op.and] : [];

  where[Op.and] = [
    ...existing,
    {
      [Op.or]: [
        { name: { [Op.like]: like } },
        { email: { [Op.like]: like } },
        { postcode: { [Op.like]: like } },
      ],
    },
  ];

  return where;
}

module.exports = { applyUserSearchFilter };
