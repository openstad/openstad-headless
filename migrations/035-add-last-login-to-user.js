let db = require('../src/db').sequelize;

module.exports = {
  up: function() {

    try {
      return db.query(`
        ALTER TABLE users ADD lastLogin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER extraData; 
			`);
    } catch(e) {
      return true;
    }

  }
}
