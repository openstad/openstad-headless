const config     = require('config');
const merge      = require('merge');
const nodemailer = require('nodemailer');
const MailConfig = require('./mail-config');

const transport = config.get('mail.transport');

exports.getTransporter = (project) => {

  let projectConfig = new MailConfig(project)

  const method = projectConfig.getMailMethod();
  const transporterConfig = projectConfig.getMailTransport();
  
  let transporter;
  
  switch (method) {
    case 'smtp':
      transporter = nodemailer.createTransport(transporterConfig);
      break;
    
    case 'sendgrid':
      const sendGrid = require('nodemailer-sendgrid-transport');
      const sgConfig = sendGrid(transporterConfig);
      
      transporter = nodemailer.createTransport(sgConfig);
      break;
  }
  
  return transporter;
  
}
