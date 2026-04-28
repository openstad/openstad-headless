let db = require('../src/db').sequelize;

module.exports = {
  up: function () {
    return db
      .query(
        `
        RENAME TABLE idea_tags TO resource_tags;
`
      )
      .catch(() => true);
  },
};
