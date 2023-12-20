let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        RENAME TABLE ideas TO resources;
`);
    } catch(e) {
      return true;
    }
  }
}
