var db = require('../db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        UPDATE users SET name = CONCAT(
          IF(firstName IS NOT NULL, firstName, ''),
          IF(firstName IS NOT NULL AND lastName IS NOT NULL, ' ', ''),
          IF(lastName IS NOT NULL, lastName, '')
        );
      `);
    } catch(e) {
      return true;
    }
  },
}
