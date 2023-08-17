var db = require('../src/db').sequelize;

module.exports = {
  up: async function () {
    return db.query(`ALTER TABLE users ADD CONSTRAINT unique_users_email_per_site_id UNIQUE(siteId, email);`);
  },
  down: async function () {
      return db.query(
        `ALTER TABLE users DROP CONSTRAINT unique_users_email_per_site_id`
      );
  },
};
