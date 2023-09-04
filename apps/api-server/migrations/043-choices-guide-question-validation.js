var db = require('../src/db').sequelize;

module.exports = {
    up: function() {
        try {
            return db.query(`
			  ALTER TABLE choicesGuideQuestions ADD COLUMN validation JSON NULL AFTER seqnr;
			`);
        } catch(e) {
            return true;
        }
    },
    down: function() {
        return db.query(`ALTER TABLE choicesGuideQuestions DROP validation;`);
    }
}
