const emailProvider = require('./email');
const tokenUrl = require('./tokenUrl');

exports.sendVerification = async (user, client, redirectUrl) => {

  await tokenUrl.invalidateTokensForUser(user.id);
  const generatedTokenUrl = await tokenUrl.format(client, user, redirectUrl, true);

  const clientConfig = client.config ? client.config : {};
  const authTypeConfig = clientConfig.authTypes && clientConfig.authTypes.Url ? clientConfig.authTypes.Url : {};
  const emailTemplateString = authTypeConfig.emailTemplate ? authTypeConfig.emailTemplate : false;
  const emailSubject = authTypeConfig.emailSubject ? authTypeConfig.emailSubject : 'Inloggen bij ' + client.name;
  const emailHeaderImage = authTypeConfig.emailHeaderImage ? authTypeConfig.emailHeaderImage : false;
  const emailLogo = authTypeConfig.emailLogo ? authTypeConfig.emailLogo : false;

  const transporterConfig = clientConfig.smtpTransport ? clientConfig.smtpTransport : {};

  return emailProvider.send({
    toName: (user.firstName + ' ' + user.lastName).trim(),
    toEmail: user.email,
    fromEmail: clientConfig.fromEmail,
    fromName: clientConfig.fromName,
    subject: emailSubject,
    templateString: emailTemplateString,
    template: 'emails/login-url.html',
    variables: {
      tokenUrl: generatedTokenUrl,
      firstName: user.firstName,
      clientUrl: client.mainUrl,
      clientName: client.name,
      headerImage: emailHeaderImage,
      logo: emailLogo,
    },
    transporterConfig
  });
};


