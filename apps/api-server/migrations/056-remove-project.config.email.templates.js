let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        UPDATE projects SET
          config = IF(JSON_CONTAINS_PATH(config, 'all', '$.anonymize.inactiveWarningEmail'),JSON_REMOVE(config, '$.anonymize.inactiveWarningEmail'), config ),
          config = IF(JSON_CONTAINS_PATH(config, 'all', '$.articles.feedbackEmail'),JSON_REMOVE(config, '$.articles.feedbackEmail'), config ),
          config = IF(JSON_CONTAINS_PATH(config, 'all', '$.ideas.feedbackEmail'),JSON_REMOVE(config, '$.ideas.feedbackEmail'), config ),
          config = IF(JSON_CONTAINS_PATH(config, 'all', '$.ideas.conceptEmail'),JSON_REMOVE(config, '$.ideas.conceptEmail'), config ),
          config = IF(JSON_CONTAINS_PATH(config, 'all', '$.ideas.conceptToPublishedEmail'),JSON_REMOVE(config, '$.ideas.conceptToPublishedEmail'), config ),
          config = IF(JSON_CONTAINS_PATH(config, 'all', '$.newslettersignup.confirmationEmail'),JSON_REMOVE(config, '$.newslettersignup.confirmationEmail'), config ),
          config = IF(JSON_CONTAINS_PATH(config, 'all', '$.notifications'),JSON_REMOVE(config, '$.notifications'), config );
`);
    } catch(e) {
      console.log(e);
      return true;
    }
  }
}


