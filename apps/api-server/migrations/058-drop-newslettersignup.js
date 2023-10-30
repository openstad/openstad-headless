let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        DROP TABLE newslettersignups;
`);
    } catch(e) {
      return true;
    }
  }
}
