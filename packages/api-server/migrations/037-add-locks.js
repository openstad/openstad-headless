let db = require('../src/db').sequelize;

module.exports = {
  up: function() {

    try {
      return db.query(`

        CREATE TABLE locks (
          id int(11) NOT NULL,
          type varchar(255) COLLATE utf8_unicode_ci NOT NULL,
          createdAt datetime NOT NULL,
          updatedAt datetime NOT NULL,
          deletedAt datetime DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        
        ALTER TABLE locks
          ADD PRIMARY KEY (id);
        
        ALTER TABLE locks
          MODIFY id int(11) NOT NULL AUTO_INCREMENT;
        COMMIT;

			`);
    } catch(e) {
      return true;
    }

  }
}
