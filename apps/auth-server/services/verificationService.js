const emailProvider = require('./email');
const fetch = require('node-fetch');
const tokenUrl = require('./tokenUrl');
const tokenSMS = require('./tokenSMS');

exports.sendVerification = async (user, client, redirectUrl, adminLoginRequest) => {

  /**
   * For now we don't invalidate tokens
   * This causes a lot of UX issues with users.
   * When they send double, email is late, the enter a loop of not being able to login.
   * We keep the token shortlived and invalidate all after login
   */
//   await tokenUrl.invalidateTokensForUser(user.id);

  const generatedTokenUrl = await tokenUrl.format(client, user, redirectUrl, adminLoginRequest);

  const clientConfig = client.config ? client.config : {};
  const clientConfigStyling = clientConfig.styling ?  clientConfig.styling : {};
  const authTypeConfig = clientConfig.authTypes && clientConfig.authTypes.Url ? clientConfig.authTypes.Url : {};
  const emailTemplateString = authTypeConfig.emailTemplate ? authTypeConfig.emailTemplate : false;
  const emailSubject = authTypeConfig.emailSubject ? authTypeConfig.emailSubject : 'Inloggen bij ' + client.name;
  const emailHeaderImage = authTypeConfig.emailHeaderImage ? authTypeConfig.emailHeaderImage : false;
  const transporterConfig = clientConfig.smtpTransport ? clientConfig.smtpTransport : {};


  let emailLogo;

  // load env sheets that have been set for complete Environment, not specific for just one client
  if (process.env.LOGO) {
    emailLogo = process.env.LOGO;
  }

  if (clientConfigStyling && clientConfigStyling.logo) {
    emailLogo = clientConfigStyling.logo;
  }

  if (clientConfig && clientConfig.emailLogo) {
    emailLogo = clientConfig.emailLogo;
  }

  return emailProvider.send({
    toName: user.name || false,
    toEmail: user.email,
    fromEmail: clientConfig.fromEmail,
    fromName: clientConfig.fromName,
    subject: emailSubject,
    templateString: emailTemplateString,
    template: 'emails/login-url.html',
    variables: {
      tokenUrl: generatedTokenUrl,
      name: user.name,
      clientUrl: client.mainUrl,
      clientName: client.name,
      headerImage: emailHeaderImage,
      logo: emailLogo,
      loginurl: generatedTokenUrl,
      user,
      imagePath: process.env.EMAIL_ASSETS_URL,
    },
    transporterConfig
  });
};

exports.sendSMS = async (user, client, redirectUrl) => {

  // ToDo: dit is nu KPN specifiek en zou generieker moeten zijn

  await tokenSMS.invalidateTokensForUser(user.id);
  const generatedToken = await tokenSMS.format(client, user);

  const config = client.config || {};
  const configAuthType = config.authTypes && config.authTypes['Phonenumber'] || {};

  let kpnClientId = process.env.KPN_CLIENT_ID;
  let kpnClientSecret = process.env.KPN_CLIENT_SECRET;
  if (!kpnClientId || !kpnClientSecret) throw new Error('SMS failed')

  let response = await fetch('https://api-prd.kpn.com/oauth/client_credential/accesstoken?grant_type=client_credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${kpnClientId}&client_secret=${kpnClientSecret}`
  })
  let json = await response.json();

  let accessToken = json && json.access_token;
  if (!accessToken) throw new Error('SMS failed')

  let text = configAuthType.smsCodeText || 'Code: [[code]]';
  text = text.replace('[[code]]', generatedToken)

  let sender = configAuthType.smsCodeSender || 'OpenStad';

  let headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-type': 'application/json' };

  let body = {
      "messages": [
        {
          "content": text,
          "mobile_number": user.phoneNumber
        }
      ],
      "sender": sender
  };

  console.log('https://api-prd.kpn.com/messaging/sms-kpn/v1/send', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });

  response = await fetch('https://api-prd.kpn.com/messaging/sms-kpn/v1/send', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    console.log(response);
    throw new Error('SMS failed')
  }

  return;

};
