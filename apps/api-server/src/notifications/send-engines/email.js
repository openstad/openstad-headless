const config = require('config');
const nodemailer = require('nodemailer');

module.exports = async function sendMessage({ message }) {

  try {

    let method = config.mail.method;
    let transporter = await nodemailer.createTransport(config.mail.transport[method]);

    // TODO: attachments?

    let result = await transporter.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.body,
    });
    console.log(result);

  } catch(err) {
    throw err;
  }
}
