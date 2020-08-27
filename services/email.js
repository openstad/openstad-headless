const nunjucks          = require('nunjucks');
const path              = require('path');
const nodemailer        = require('nodemailer');
const Promise           = require("bluebird");
const dateFilter        = require('../nunjucks/dateFilter');
const currencyFilter    = require('../nunjucks/currency');
const limitTo           = require('../nunjucks/limitTo');
const jsonFilter        = require('../nunjucks/json');
const timestampFilter   = require('../nunjucks/timestamp');

const formatTransporter = function ({ host, port, secure, auth }) {
  return {
    host:   host ? host : process.env.MAIL_SERVER_URL,
    port:   port ? port : process.env.MAIL_SERVER_PORT,
    secure: secure ? secure : process.env.MAIL_SERVER_SECURE,
    auth:   {
      user: (auth && auth.user) ? auth.user : process.env.MAIL_SERVER_USER_NAME,
      pass: (auth && auth.pass) ? auth.pass : process.env.MAIL_SERVER_PASSWORD,
    },
  };
};

exports.send = function ({subject, toName, toEmail, templateString, template, variables, fromEmail, fromName, replyTo, transporterConfig}) {

  /**
   * Enrich variables with URLS in order to make absolute urls in E-mails
   */
  variables = Object.assign(variables, {
    emailAssetsUrl: process.env.EMAIL_ASSETS_URL,
    appUrl: process.env.APP_URL
  });

  /**
   * Initiatilize Nunjucks to render E-mail template
   */
  const nunjucksEnv = nunjucks.configure(path.resolve(__dirname,'../views'), {
    autoescape: true,
  });

  nunjucksEnv.addFilter('date', dateFilter);

  /**
   * This is for legacy reasons
   * if extends 'emails/layout.html' then render as a string
   * if not included then include by rendering the string and then rendering a blanco
   * the layout by calling the blanco template
   */
  if (templateString) {
    if (templateString.includes("{% extends 'emails/layout.html' %}")) {
      templateString  = nunjucks.renderString(templateString, variables)
    } else {
      templateString = nunjucks.render('emails/blanco.html', Object.assign(variables, {
        message: nunjucks.renderString(templateString, variables)
      }));
    }
  }


  /**
   * Render email template
   */
  const mail = templateString ? templateString : nunjucks.render(template, variables);

  /**
    * Format the to name
    */
  const to = !!toName ? `${toName}<${toEmail}>` : toEmail;

  /**
   * If from name & e-mail not specified fallback to default in .env
   */
  fromEmail = fromEmail ? fromEmail : process.env.FROM_EMAIL;
  fromName = fromName ? fromName : process.env.FROM_NAME;

  /**
   * Format Message object
   */
  const message = {
    from: `${fromName}<${fromEmail}>`,// sender@server.com',
    to: to,
    subject: subject,
    html: mail,
  };

  if (replyTo) {
    message.replyTo = replyTo;
  }

  /**
   * Create instance of MAIL transporter
   */
  transporterConfig = transporterConfig ? transporterConfig : {};
  const transporter = nodemailer.createTransport(formatTransporter(transporterConfig));

  return new Promise(function(resolve, reject) {
    // send mail with defined transport object
    transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log('email error', error);
          return reject(error);
        } else {
          console.log('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
        //  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          resolve();
        }

    })
  });
}
