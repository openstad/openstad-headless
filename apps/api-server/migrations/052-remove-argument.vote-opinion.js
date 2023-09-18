let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE comment_votes DROP opinion;`);
    } catch(e) {
      return true;
    }
  }
}
