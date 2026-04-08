let db = require('../src/db').sequelize;

module.exports = {
  up: async function () {
    try {
      return await db.query(`
        RENAME TABLE ideas TO resources;
`);
    } catch (e) {
      return true;
    }
  },
};
