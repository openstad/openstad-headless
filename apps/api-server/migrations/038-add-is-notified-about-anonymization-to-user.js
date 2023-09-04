let db = require('../src/db').sequelize;

module.exports = {
  up: function() {

    try {
      return db.query(`
        ALTER TABLE users ADD isNotifiedAboutAnonymization DATETIME NULL DEFAULT NULL AFTER lastLogin; 
			`);
    } catch(e) {
      return true;
    }

  }
}
