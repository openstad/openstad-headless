const merge = require('merge');
const config = require('config');
const configField = require('../models/lib/config-field');

class MailConfig {
  constructor(project) {
    let self = this;

    let defaultProjectConfig = configField.parseConfig('projectConfig', {});
    defaultProjectConfig = merge.recursive(
      defaultProjectConfig,
      configField.parseConfig('projectEmailConfig', {})
    );

    return Promise.resolve('force async constructor').then(async (noop) => {
      const db = require('../db');
      project = await db.Project.scope(
        'defaultScope',
        'includeEmailConfig'
      ).findByPk(project.id);

      self.config = merge.recursive(true, defaultProjectConfig, config || {});

      // Exceptions from local config because field names don't match
      self.config.hostname = self.config.hostname || self.config.title;
      self.config.title = self.config.projectName || self.config.title;

      self.config = merge.recursive(self.config, project.config || {});

      // email templates have been moved to project.emailConfig
      self.config = merge.recursive(self.config, project.emailConfig || {});

      // Put the title in the config as well
      self.config.title = project.title || self.config.title;

      return self;
    });
  }

  getTitle() {
    return this.config.title;
  }

  getCmsUrl() {
    return this.config.url;
  }

  getCmsHostname() {
    return this.config.hostname;
  }

  getResourceConfig() {
    console.log(self.config);
    return this.config.resources || {};
  }

  getResourceFeedbackEmail() {
    return this.getResourceConfig().feedbackEmail || {};
  }

  getResourceConceptEmail() {
    return this.getResourceConfig().conceptEmail || {};
  }

  getResourceConceptToPublishedEmail() {
    return this.getResourceConfig().conceptToPublishedEmail || {};
  }

  getFeedbackEmailFrom() {
    return this.getResourceFeedbackEmail().from || config.mail.from;
  }

  getFeedbackEmailInzendingPath() {
    return this.getResourceFeedbackEmail().inzendingPath;
  }

  getResourceFeedbackEmailTemplate() {
    return (
      this.getResourceFeedbackEmail().template || 'No template'
    );
  }

  getResourceFeedbackEmailAttachments() {
    return this.getResourceFeedbackEmail().attachments;
  }

  getResourceFeedbackEmailSubject() {
    return this.getResourceFeedbackEmail().subject;
  }

  getMailMethod() {
    return this.config.mail.method || 'smtp';
  }

  getMailTransport() {
    return this.config.mail.transport[this.getMailMethod()];
  }

  getLogo() {
    let logo = this.config.styling.logo;

    if (process.env.LOGO) {
      logo = process.env.LOGO;
    }

    return logo;
  }

  getDefaultEmailAttachments() {
    const logo = this.getLogo();
    const attachments = [];

    // if logo is amsterdam, we fallback to old default logo and include it
    if (logo === 'amsterdam') {
      attachments.push('logo.png');
    }

    if (!logo) {
      attachments.push('openstad-logo.png');
    }

    return attachments;
  }
}

module.exports = MailConfig;
