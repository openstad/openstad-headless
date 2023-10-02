let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE ideas ADD images LONGTEXT NOT NULL DEFAULT '[]' AFTER description;`);
    } catch(e) {
      console.log(e);
      return true;
    }
  }
}
