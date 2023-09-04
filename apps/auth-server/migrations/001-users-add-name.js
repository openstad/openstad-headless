var db = require('../db').sequelize;

module.exports = {
	up: function() {
		return db.query(`
      ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL DEFAULT NULL AFTER id;
		`);
	},
}
