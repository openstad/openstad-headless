let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE users ADD name VARCHAR(256) NULL DEFAULT NULL AFTER email;
        UPDATE users SET name = CONCAT(firstName, ' ', lastName);
        ALTER TABLE users drop firstName;
        ALTER TABLE users drop lastName;`);
    } catch(e) {
      return true;
    }
  }
}
