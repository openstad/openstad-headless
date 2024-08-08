const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = async function sendMessage({ message }) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_TRANSPORT_SMTP_HOST,
      port: process.env.MAIL_TRANSPORT_SMTP_PORT,
      secure: process.env.MAIL_TRANSPORT_SMTP_REQUIRESSL === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_TRANSPORT_SMTP_AUTH_USER,
        pass: process.env.MAIL_TRANSPORT_SMTP_AUTH_PASS
      }
    });

    await transporter.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.body,
    });

  } catch (err) {
    console.error(err);
    throw err;
  }
}