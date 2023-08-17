let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE users drop complete;`);
    } catch(e) {
      return true;
    }
  }
}
