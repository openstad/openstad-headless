let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE projects drop domain;`);
    } catch(e) {
      return true;
    }
  }
}
