let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        ALTER TABLE users ADD idpUser LONGTEXT NULL DEFAULT '{}' AFTER siteId;
        UPDATE users SET idpUser = IF( users.externalUserId IS NOT NULL, CONCAT('{"identifier": "', users.externalUserId, '", "accesstoken": "', externalAccessToken, '", "idp" : "openstad"}'), '{}');
        ALTER TABLE users drop externalUserId;
        ALTER TABLE users drop externalAccessToken;`);
    } catch(e) {
      return true;
    }
  }
}
