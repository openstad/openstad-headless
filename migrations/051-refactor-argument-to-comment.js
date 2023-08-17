let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        RENAME TABLE arguments TO comments;
        RENAME TABLE argument_votes TO comment_votes;
        ALTER TABLE comment_votes CHANGE argumentId commentId INT(11) NOT NULL DEFAULT '0'; 
`);
    } catch(e) {
      return true;
    }
  }
}
