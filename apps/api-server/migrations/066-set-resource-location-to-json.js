let db = require('../src/db').sequelize;

module.exports = {
  up: function () {
    return db
      .query(
        `
        ALTER TABLE resources DROP location;
        ALTER TABLE resources ADD location JSON NULL DEFAULT NULL AFTER extraData;`
      )
      .catch(() => true);
  },
};
