var db = require('../db').sequelize;

module.exports = {
	up: function() {
		return db.query(`
		  ALTER TABLE users DROP lastName;
		`);
	},
}
