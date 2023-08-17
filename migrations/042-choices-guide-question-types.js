var db = require('../src/db').sequelize;

module.exports = {
    up: function() {
        try {
            return db.query(`
			  ALTER TABLE choicesGuideQuestions MODIFY COLUMN type ENUM('continuous', 'enum-buttons', 'enum-radio', 'a-to-b', 'input', 'textarea', 'multiple-choice') DEFAULT 'continuous' NOT NULL;
			`);
        } catch(e) {
            return true;
        }
    },
    down: function() {
        return db.query(`
            ALTER TABLE choicesGuideQuestions MODIFY COLUMN type ENUM('continuous', 'enum-buttons', 'enum-radio', 'a-to-b') DEFAULT 'continuous' NOT NULL;
        `);
    }
}
