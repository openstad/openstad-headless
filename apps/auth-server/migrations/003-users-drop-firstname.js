var db = require('../db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE users DROP firstName;
      `);
    } catch(e) {
      return true;
    }
  },
}
