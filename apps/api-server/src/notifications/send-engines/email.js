const config = require('config');
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = async function sendMessage({ message }) {
  try {
    console.log('Creating transporter with the following configuration:');
    console.log({
      host: process.env.MAIL_TRANSPORT_SMTP_HOST,
      port: process.env.MAIL_TRANSPORT_SMTP_PORT,
      secure: process.env.MAIL_TRANSPORT_SMTP_REQUIRESSL === 'true',
      auth: {
        user: process.env.MAIL_TRANSPORT_SMTP_AUTH_USER,
        // Do not log the password for security reasons
      }
    });

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_TRANSPORT_SMTP_HOST,
      port: process.env.MAIL_TRANSPORT_SMTP_PORT,
      secure: process.env.MAIL_TRANSPORT_SMTP_REQUIRESSL === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_TRANSPORT_SMTP_AUTH_USER,
        pass: process.env.MAIL_TRANSPORT_SMTP_AUTH_PASS
      }
    });

    console.log('Sending email with the following message:');
    console.log({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.body,
    });

    let result = await transporter.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.body,
    });

    console.log('Email sent successfully:');
    console.log(result);

  } catch (err) {
    console.error('Error occurred while sending email:');
    console.error(err);
    throw err;
  }
}