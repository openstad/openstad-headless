let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        UPDATE users SET postcode = zipCode WHERE postcode = NULL;
        ALTER TABLE users drop zipCode;`);
    } catch(e) {
      return true;
    }
  }
}
