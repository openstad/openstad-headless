var db = require('../src/db').sequelize;

module.exports = {
	up: function() {
		try {
			return db.query(`
				UPDATE ideas 
				SET publishDate = createdAt
			`);
		} catch(e) {
			return true;
		}
	},
	down: function() {
		return db.query(`ALTER TABLE ideas DROP publishDate;`);
	}
}

