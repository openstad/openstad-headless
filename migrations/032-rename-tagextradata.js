let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE tags CHANGE tagsExtraData extraData LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL; ;
			`);
    } catch(e) {
      return true;
    }
  }
}
