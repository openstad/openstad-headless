var db = require('../db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE users DROP lastName;
      `);
    } catch(e) {
      return true;
    }
  },
}
