let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE tags ADD type VARCHAR(30) NULL DEFAULT NULL AFTER name;`);
    } catch(e) {
      return true;
    }
  }, down: function() {
    try {
        return db.query(`
        ALTER TABLE tags DROP IF EXISTS type;`);
      } catch(e) {
        return true;
      }
  }
}
