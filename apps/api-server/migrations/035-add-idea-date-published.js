var db = require('../src/db').sequelize;

module.exports = {
	up: function() {
		try {
			return db.query(`
			  ALTER TABLE ideas ADD COLUMN publishDate datetime NULL AFTER updatedAt;
			`);
		} catch(e) {
			return true;
		}
	},
	down: function() {
		return db.query(`ALTER TABLE ideas DROP publishDate;`);
	}
}

