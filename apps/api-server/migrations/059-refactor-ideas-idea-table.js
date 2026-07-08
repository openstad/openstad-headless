let db = require('../src/db').sequelize;

module.exports = {
  up: function () {
    return db
      .query(
        `
      RENAME TABLE ideas TO resources;
    `
      )
      .catch(() => true);
  },
};
