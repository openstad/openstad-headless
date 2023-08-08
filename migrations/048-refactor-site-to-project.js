let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        RENAME TABLE sites TO projects;
        ALTER TABLE articles CHANGE siteId projectId INT(11) NOT NULL DEFAULT '0'; 
        ALTER TABLE choicesGuides CHANGE siteId projectId INT(11) NOT NULL DEFAULT '0'; 
        ALTER TABLE ideas CHANGE siteId projectId INT(11) NOT NULL DEFAULT '0'; 
        ALTER TABLE newslettersignups CHANGE siteId projectId INT(11) NOT NULL DEFAULT '0'; 
        ALTER TABLE submissions CHANGE siteId projectId INT(11) NOT NULL DEFAULT '0'; 
        ALTER TABLE tags CHANGE siteId projectId INT(11) NOT NULL DEFAULT '0'; 
        ALTER TABLE users CHANGE siteId projectId INT(11) NULL DEFAULT NULL;
`);
    } catch(e) {
      return true;
    }
  }
}
