let db = require('../src/db').sequelize;

module.exports = {
  up: function() {

    try {
      return db.query(`
        ALTER TABLE locks DROP deletedAt; 
			`);
    } catch(e) {
      return true;
    }

  }
}
