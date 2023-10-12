const mail = require('../lib/mail');
const config = require('config');
const nunjucks = require('nunjucks');

module.exports = {
  /**
   * Send notification to recipient
   * @param emailData
   * @param recipient
   */
  notify: async (emailData, recipient, projectId) => {
    const db = require('../db');
    const project = await db.Project.findByPk(projectId);
    const myConfig = Object.assign({}, config, project && project.config);

    const data = {};
    data.to = recipient.email;
    data.from = ( myConfig.notifications && myConfig.notifications.fromAddress ) || myConfig.mail.from;
    data.subject = emailData.subject;

    data.EMAIL = data.from;
    data.HOSTNAME = ( myConfig.cms && ( myConfig.cms.hostname || myConfig.cms.domain ) ) || myConfig.domain;
    data.URL = ( myConfig.cms && myConfig.cms.url ) || myConfig.url || ( 'https://' + emailData.HOSTNAME );
    data.PROJECTNAME = ( project && project.title ) || myConfig.projectName;

    emailData.PROJECTNAME = data.PROJECTNAME;
    emailData.logo = project.config.styling.logo;

    emailData.text = nunjucks.renderString(emailData.text, emailData);
    data.html = nunjucks.render(emailData.template, emailData);

    mail.sendNotificationMail(data);
  }
}
