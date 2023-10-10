const config = require('config');
const nodemailer = require('nodemailer');
const merge = require('merge');
const {htmlToText} = require('html-to-text');
const MailConfig = require('./mail-config');
const mailTransporter = require('./mailTransporter');

const debug = require('debug');
const log = debug('app:mail:sent');
const logError = debug('app:mail:error');

// nunjucks is used when sending emails
var nunjucks = require('nunjucks');
var moment = require('moment-timezone');
var env = nunjucks.configure('email');

var dateFilter = require('../lib/nunjucks-date-filter');
dateFilter.setDefaultFormat('DD-MM-YYYY HH:mm');
env.addFilter('date', dateFilter);

// Global variables.
env.addGlobal('HOSTNAME', config.get('domain'));
env.addGlobal('PROJECTNAME', config.get('projectName'));
//env.addGlobal('PAGENAME_POSTFIX', config.get('pageNamePostfix'));
env.addGlobal('EMAIL', config.get('mail.from'));

env.addGlobal('GLOBALS', config.get('express.rendering.globals'));

env.addGlobal('config', config)

// Default options for a single email.
let defaultSendMailOptions = {
  from: config.get('mail.from'),
  subject: 'No title',
  text: 'No message'
};

// generic send mail function
function sendMail(project, options) {

  if (options.attachments) {
    options.attachments.forEach((entry, index) => {
      options.attachments[index] = {
        filename: entry,
        path: 'email/uploads/' + entry,
        cid: entry
      }
    });
  }

  mailTransporter.getTransporter(project)
    .then(
      transporter => {
        transporter.sendMail(
          merge(defaultSendMailOptions, options),
          function (error, info) {
            if (error) {
              logError(error.message);
            } else {
              log(info.response);
            }
          }
        )
      })
}

async function sendNotificationMail(data, project) {

  let projectConfig = await new MailConfig(project)
  data.logo = projectConfig.getLogo();

  let html;

  if (data.html) {
    html = data.html
  } else if (data.template) {
    html = nunjucks.renderString(data.template, data)
  } else {
    html = nunjucks.render('notifications_admin.njk', data)
  }

  sendMail(project, {
    to: data.to,
    from: data.from,
    subject: data.subject,
    html: html,
    text: `Er hebben recent activiteiten plaatsgevonden op ${data.PROJECTNAME} die mogelijk voor jou interessant zijn!`,
    attachments: projectConfig.getDefaultEmailAttachments(),
  });
};

async function sendConceptEmail(resource, resourceType, project, user) {

  let projectConfig = await new MailConfig(project)
  if (!resourceType) return console.error('sendConceptMail error: resourceType not provided');

  let resourceConceptEmail = projectConfig.getResourceConceptEmail(resourceType);
  const hasBeenPublished = resource.publishDate;
  if(hasBeenPublished) {
    resourceConceptEmail = projectConfig.getResourceConceptToPublishedEmail(resourceType);
  }

  const url = projectConfig.getCmsUrl();
  const logo = projectConfig.getLogo();
  const hostname = projectConfig.getCmsHostname();
  const projectname = projectConfig.getTitle();

  let inzendingPath = resourceConceptEmail.inzendingPath;
  const inzendingURL = getInzendingURL(inzendingPath, url, resource, resourceType);

  let fromAddress = resourceConceptEmail.from || config.email;
  if (!fromAddress) return console.error('Email error: fromAddress not provided');
  if (fromAddress.match(/^.+<(.+)>$/, '$1')) fromAddress = fromAddress.replace(/^.+<(.+)>$/, '$1');

  const data = prepareEmailData(user, resource, hostname, projectname, inzendingURL, url, fromAddress, logo);


  const template = resourceConceptEmail.template;
  const html = prepareHtml(template, data);
  const text = convertHtmlToText(html);
  const attachments = resourceConceptEmail.attachments || projectConfig.getDefaultEmailAttachments();

  try {
    sendMail(project, {
      to: resource.email ? resource.email : user.email,
      from: fromAddress,
      subject: resourceConceptEmail.subject || 'Bedankt voor je CONCEPT inzending!',
      html: html,
      text: text,
      attachments,
    });
  } catch (err) {
    console.log(err);
  }
}

// send email to user that submitted a resource
async function sendThankYouMail(resource, resourceType, project, user) {

  let projectConfig = await new MailConfig(project)
  
  if (!resourceType) return console.error('sendThankYouMail error: resourceType not provided');

  const url = projectConfig.getCmsUrl();
  const hostname = projectConfig.getCmsHostname();
  const projectname = projectConfig.getTitle();
  let inzendingPath = projectConfig.getFeedbackEmailInzendingPath(resourceType);
  const inzendingURL = getInzendingURL(inzendingPath, url, resource, resourceType);

  let fromAddress = projectConfig.getFeedbackEmailFrom(resourceType) || config.email;
  if (!fromAddress) return console.error('Email error: fromAddress not provided');
  if (fromAddress.match(/^.+<(.+)>$/, '$1')) fromAddress = fromAddress.replace(/^.+<(.+)>$/, '$1');


  const logo = projectConfig.getLogo();
  const data = prepareEmailData(user, resource, hostname, projectname, inzendingURL, url, fromAddress, logo);
  
  let template = projectConfig.getResourceFeedbackEmailTemplate(resourceType);
  const html = prepareHtml(template, data);
  const text = convertHtmlToText(html);
  const attachments = projectConfig.getResourceFeedbackEmailAttachments(resourceType) || projectConfig.getDefaultEmailAttachments();


  try {
    sendMail(project, {
      // in some cases the resource, like order or account has a different email from the submitted user, default to resource, otherwise send to owner of resource
      to: resource.email ? resource.email : user.email,
      from: fromAddress,
      subject: projectConfig.getResourceFeedbackEmailSubject(resourceType) || 'Bedankt voor je inzending',
      html: html,
      text: text,
      attachments,
    });
  } catch (err) {
    console.log(err);
  }
}

function prepareEmailData(user, resource, hostname, projectname, inzendingURL, url, fromAddress, logo ) {
  return {
    date: new Date(),
    user,
    idea: resource,
    article: resource,
    HOSTNAME: hostname,
    PROJECTNAME: projectname,
    inzendingURL,
    URL: url,
    EMAIL: fromAddress,
    logo
  };
}

function prepareHtml(template, data) {
  /**
   * This is for legacy reasons
   * if contains <html> we assume it doesn't need a layout wrapper then render as a string
   * if not included then include by rendering the string and then rendering a blanco
   * the layout by calling the blanco template
   */
  let html;
  if (template.includes("<html>")) {
    html = nunjucks.renderString(template, data)
  } else {
    html = nunjucks.render('blanco.njk', Object.assign(data, {
      message: nunjucks.renderString(template, data)
    }));
  }
  return html;
}

function convertHtmlToText(html) {
  return htmlToText(html, {
    ignoreImage: true,
    hideLinkHrefIfSameAsText: true,
    uppercaseHeadings: false
  });
}

// send email to user that submitted a NewsletterSignup
async function sendNewsletterSignupConfirmationMail(newslettersignup, project, user) {

  let projectConfig = await new MailConfig(project)

  const url = projectConfig.getCmsUrl();
  const hostname = projectConfig.getCmsHostname();
  const projectname = projectConfig.getTitle();
  let fromAddress = projectConfig.getFeedbackEmailFrom() || config.email;
  if (fromAddress.match(/^.+<(.+)>$/, '$1')) fromAddress = fromAddress.replace(/^.+<(.+)>$/, '$1');

  const confirmationUrl = projectConfig.getNewsletterSignupConfirmationEmailUrl().replace(/\[\[token\]\]/, newslettersignup.confirmToken)
  const logo = projectConfig.getLogo();

  const data = {
    date: new Date(),
    user: user,
    HOSTNAME: hostname,
    PROJECTNAME: projectname,
    confirmationUrl,
    URL: url,
    EMAIL: fromAddress,
    logo: logo
  };

  let html;
  let template = projectConfig.getNewsletterSignupConfirmationEmailTemplate();
  if (template) {
    html = nunjucks.renderString(template, data);
  } else {
    html = nunjucks.render('confirm_newsletter_signup.njk', data);
  }

  const text = htmlToText.fromString(html, {
    ignoreImage: true,
    hideLinkHrefIfSameAsText: true,
    uppercaseHeadings: false
  });

  const attachments = projectConfig.getNewsletterSignupConfirmationEmailAttachments();

  sendMail(project, {
    to: newslettersignup.email,
    from: fromAddress,
    subject: projectConfig.getNewsletterSignupConfirmationEmailSubject() || 'Bedankt voor je aanmelding',
    html: html,
    text: text,
    attachments,
  });

}

// send email to user that is about to be anonymized
// todo: this is a copy of sendThankYouMail and has too many code duplications; that should be merged. But since there is a new notification system that should be implemented more widly I am not going to spent time on that now
async function sendInactiveWarningEmail(project, user) {

 let projectConfig = await new MailConfig(project)

  const url = projectConfig.getCmsUrl();
  const hostname = projectConfig.getCmsHostname();
  const projectname = projectConfig.getTitle();
  let fromAddress = project.config.notifications.fromAddress || config.email;
  if (!fromAddress) return console.error('Email error: fromAddress not provided');
  if (fromAddress.match(/^.+<(.+)>$/, '$1')) fromAddress = fromAddress.replace(/^.+<(.+)>$/, '$1');
  const logo = projectConfig.getLogo();

  const XDaysBeforeAnonymization = project.config.anonymize && (project.config.anonymize.anonymizeUsersAfterXDaysOfInactivity - project.config.anonymize.warnUsersAfterXDaysOfInactivity) || 60;
  let ANONYMIZEDATE = new Date();
  ANONYMIZEDATE = ANONYMIZEDATE.setDate(ANONYMIZEDATE.getDate()+XDaysBeforeAnonymization);
  ANONYMIZEDATE = new Date(ANONYMIZEDATE).toLocaleDateString("nl-NL");

  let data = {
    date: new Date(),
    user: user,
    HOSTNAME: hostname,
    PROJECTNAME: projectname,
    URL: url,
    EMAIL: fromAddress,
    logo: logo,
    XDaysBeforeAnonymization,
    DISPLAYNAME: user.displayName,
    ANONYMIZEDATE,
  };

  let template = project.config.anonymize.inactiveWarningEmail.template;
  let html = nunjucks.renderString(template, data);

  let text = htmlToText.fromString(html, {
    ignoreImage: true,
    hideLinkHrefIfSameAsText: true,
    uppercaseHeadings: false
  });

  let attachments = projectConfig.getResourceFeedbackEmailAttachments('idea') || projectConfig.getDefaultEmailAttachments();

  try {
    sendMail(project, {
      to: user.email,
      from: fromAddress,
      subject: project.config.anonymize.inactiveWarningEmail.subject || 'Je account wordt binnenkort verwijderd',
      html: html,
      text: text,
      attachments,
    });
  } catch (err) {
    console.log(err);
  }

}

function getInzendingURL(inzendingPath, url, resource, resourceType) {
  let idRegex = new RegExp(`\\{(?:${resourceType}|idea)?Id\\}`, 'g');
  let oldIdRegex = new RegExp(`\\[\\[(?:${resourceType}|idea)?Id\\]\\]`, 'g');

  inzendingPath = inzendingPath && inzendingPath
  .replace(idRegex, resource.id)
  .replace(oldIdRegex, resource.id)
  .replace(/\[\[resourceType\]\]/, resourceType) || "/";
  return url + inzendingPath;
}

module.exports = {
  sendMail,
  sendNotificationMail,
  sendThankYouMail,
  sendConceptEmail,
  sendNewsletterSignupConfirmationMail,
  sendInactiveWarningEmail,
};
