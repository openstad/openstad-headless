let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE tags ADD seqnr INT(11) NOT NULL DEFAULT 10 AFTER type;`);
    } catch(e) {
      console.log(e);
      return true;
    }
  }
}
