let db = require('../src/db').sequelize;

module.exports = {
  up: function() {

    try {
      return db.query(`
        ALTER TABLE ideas DROP FOREIGN KEY ideas_ibfk_2;
			`);
    } catch(e) {
      return true;
    }

    try {
      return db.query(`
        ALTER TABLE articles DROP IF EXISTS endDate;
        ALTER TABLE ideas DROP IF EXISTS endDate;
        ALTER TABLE ideas DROP INDEX IF EXISTS meetingId;
        ALTER TABLE ideas DROP IF EXISTS meetingId;
        DROP TABLE IF EXISTS meetings;
			`);
    } catch(e) {
      return true;
    }

  }
}
