var db = require('../db').sequelize;

module.exports = {
	up: function() {
		return db.query(`
      UPDATE users SET name = CONCAT(
        IF(firstName IS NOT NULL, firstName, ''),
        IF(firstName IS NOT NULL AND lastName IS NOT NULL, ' ', ''),
        IF(lastName IS NOT NULL, lastName, '')
      );
		`);
	},
}
