let db = require('../src/db').sequelize;

module.exports = {
  up: function() {

    try {
      return db.query(`
        ALTER TABLE arguments MODIFY COLUMN sentiment
        ENUM('against', 'for', 'no sentiment');
			`);
    } catch(e) {
      return true;
    }

  }
}
