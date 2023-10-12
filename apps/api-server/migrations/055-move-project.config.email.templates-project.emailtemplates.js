let db = require('../src/db').sequelize;

module.exports = {
  up: function() {
    try {
      return db.query(`
        UPDATE projects SET
          emailConfig = JSON_SET(emailConfig, '$.anonymize', JSON_OBJECT('inactiveWarningEmail', JSON_EXTRACT(config, '$.anonymize.inactiveWarningEmail'))),
          emailConfig = JSON_SET(emailConfig, '$.articles', JSON_OBJECT('FeedbackEmail', JSON_EXTRACT(config, '$.articles.feedbackEmail'))),
          emailConfig = JSON_SET(emailConfig, '$.ideas', JSON_OBJECT('FeedbackEmail', JSON_EXTRACT(config, '$.ideas.feedbackEmail'))),
          emailConfig = JSON_SET(emailConfig, '$.ideas', JSON_OBJECT('ConceptEmail', JSON_EXTRACT(config, '$.ideas.conceptEmail'))),
          emailConfig = JSON_SET(emailConfig, '$.ideas', JSON_OBJECT('ConceptToPublishedEmail', JSON_EXTRACT(config, '$.ideas.conceptToPublishedEmail'))),
          emailConfig = JSON_SET(emailConfig, '$.newslettersignup', JSON_OBJECT('ConfirmationEmail', JSON_EXTRACT(config, '$.newslettersignup.confirmationEmail'))),
          emailConfig = JSON_SET(emailConfig, '$.notifications', JSON_EXTRACT(config, '$.notifications'));
`);
    } catch(e) {
      console.log(e);
      return true;
    }
  }
}


