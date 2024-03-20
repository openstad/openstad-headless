var db = require('../db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE clients DROP siteUrl;
      `);
    } catch(e) {
      return true;
    }
  },
}
