var db = require('../db').sequelize;

module.exports = {
	up: function() {
		return db.query(`
      ALTER TABLE clients ADD COLUMN testmigration VARCHAR(255) NULL DEFAULT NULL AFTER id;
		`);
	},
}
