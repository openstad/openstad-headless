let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE projects ADD emailConfig LONGTEXT NOT NULL DEFAULT '{}' AFTER config;`);
    } catch(e) {
      console.log(e);
      return true;
    }
  }
}
