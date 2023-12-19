let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        UPDATE projects set config = REPLACE(config, 'idea', 'resource');
        UPDATE projects set config = REPLACE(config, 'Idea', 'Resource');
        UPDATE projects set emailConfig = REPLACE(emailConfig, 'idea', 'resource');
        UPDATE projects set emailConfig = REPLACE(emailConfig, 'Idea', 'Resource');
`);
    } catch(e) {
      return true;
    }
  }
}
