const nunjucks = require('nunjucks');
const rp = require('request-promise');
const path = require('path');
const nodemailer = require('nodemailer');
const Promise = require("bluebird");

/*
var dateFilter        = require('../nunjucks/dateFilter');
var currencyFilter    = require('../nunjucks/currency');
var limitTo           = require('../nunjucks/limitTo');
var jsonFilter        = require('../nunjucks/json');
var timestampFilter   = require('../nunjucks/timestamp');
*/

exports.send = function ({subject, toName, toEmail, template, variables, fromEmail, fromName, replyTo}) {

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

  /**
   * Render email template
   */
  const mail = nunjucks.render(template, variables);

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
   * Create instance of SMTP transporter
   */
  const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER_URL,
      port: process.env.MAIL_SERVER_PORT,
      secure: process.env.MAIL_SERVER_SECURE, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_SERVER_USER_NAME, // generated ethereal user
        pass: process.env.MAIL_SERVER_PASSWORD // generated ethereal password
      }
  });

  return new Promise(function(resolve, reject) {
    // send mail with defined transport object
    transporter.sendMail(message, (error, info) => {
        if (error) {
          return reject(error);
        } else {
          console.log('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          resolve();
        }

    })
  });
}
