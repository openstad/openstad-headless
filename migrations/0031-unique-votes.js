let db = require('../src/db').sequelize;

/**
 * Add unique constraint on votes table so users can't vote multiple times.
 * 
 * @todo: Before creating constraint, remove duplicates.
 */
module.exports = {
  up: function () {
    return db.query(
      `ALTER TABLE votes ADD CONSTRAINT unique_vote_per_user UNIQUE (ideaId,userId,createdAt);`
    );
  },

  down: function () {
    return db.query(`ALTER TABLE votes DROP INDEX unique_vote_per_user;`);
  },
};
