let db = require('../src/db').sequelize;

module.exports = {
  up: function() {

    try {
      return db.query(`
        ALTER TABLE locks ADD UNIQUE uniqueLocksType (type); 
			`);
    } catch(e) {
      return true;
    }

  }
}
