let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE users ADD address VARCHAR(256) NULL DEFAULT NULL AFTER phoneNumber;
        ALTER TABLE users ADD country VARCHAR(64) NULL DEFAULT NULL AFTER city;
        UPDATE users SET address = IF( TRIM(CONCAT(streetName, ' ', houseNumber, ' ', suffix)) = '', NULL, TRIM(CONCAT(streetName, ' ', houseNumber, ' ', suffix)) );
        ALTER TABLE users drop streetName;
        ALTER TABLE users drop houseNumber;
        ALTER TABLE users drop suffix;`);
    } catch(e) {
      return true;
    }
  }
}
