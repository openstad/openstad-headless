let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE polls CHANGE ideaId resourceId INT(11) NOT NULL DEFAULT '0'; 
`);
    } catch(e) {
      return true;
    }
  }
}
