let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE projects ADD url VARCHAR(2083) NULL DEFAULT NULL AFTER title;`);
    } catch(e) {
      return true;
    }
  }
}
