const memberRoleId  = process.env.MEMBER_ROLE_ID ? process.env.MEMBER_ROLE_ID : 2;
const anonymousRoleId = process.env.ANONYMOUS_ROLE_ID ? process.env.ANONYMOUS_ROLE_ID : 3;

const formatLoginUrl = (slug) => {
  return `/auth/${slug}/login`;
}

const formatRegisterUrl = (slug) => {
  return `/auth/${slug}/register`;
}

const formatSMSCodeUrl = (slug) => {
  return `/auth/${slug}/sms-code`;
}

const types = [
  {
    key: 'UniqueCode',
    label: 'Unieke code',
    loginUrl: formatLoginUrl('code'),
    title: 'Controleer stemcode',
    description: 'Vul hieronder je unieke code in om een OpenStad account aan te maken. Deze code heb je thuis gestuurd gekregen van ons.',
    label: 'Mijn stemcode',
    helpText: 'Let op, de unieke code is hoofdlettergevoelig! Werkt deze nog steeds niet? <a href="mailto:info@openstad.nl">Neem contact met ons op.</a>',
    errorMessage: 'Vul een geldige stemcode in. Heb je een typefout gemaakt? Stemcodes zijn hoofdlettergevoelig.',
    displaySidebar: false,
    displayBackbutton: true,
    displayAccountLink:  false,
    buttonText: 'Controleer stemcode',
    defaultRoleId: memberRoleId,
  },
  {
    key: 'Local',
    label: 'Inlog via Wachtwoord',
    loginUrl: formatLoginUrl('local'),
    registerUrl: formatRegisterUrl('local'),
    backbutton: true,
    displaySidebar: true,
    displayAccountLink:  false,
    defaultRoleId: memberRoleId,
  },
  {
    key: 'Phonenumber',
    label: 'Inlog via SMS',
    title: "Vraag een sms-stemcode aan",
    loginDescription: "Vul uw telefoonnummer in om een sms-stemcode te ontvangen. In stap 2 voert u de sms-code in. Als dat gelukt is komt u terug op de stemsite waar u uw stem kunt insturen. Een sms-code is 60 minuten geldig.",
    loginLabel: "Telefoonnummer:",
    loginSubtitle: "Stap 1. Vul uw telefoonnummer in",
    loginButtonText: "Stuur een sms-code",
    loginUrl: formatLoginUrl('phonenumber'),
    loginErrorMessage: 'Het is niet gelukt een sms te versturen. Controleer of u een geldig telefoonnummer heeft ingevoerd.',
    smsCodeSubtitle: "Stap 2. Voer uw sms-code in",
    smsCodeLabel: "Mijn sms-stemcode:",
    smsCodeButtonText: "Controleer de sms-code",
    smsCodeHelpText: "Het kan enkele minuten duren voordat u de sms-code ontvangt. Een sms-code is 60 minuten geldig. Geen sms gekregen na het invoeren van uw telefoonnummer?<br/><a href=\"javascript:history.back()\">Vraag nog een sms-code aan</a> of <a href=\"mailto: placemakingsluisbuurt@amsterdam.nl\">neem contact met ons op.</a>",
    smsCodeErrorMessage: 'Dat is niet de stemcode die u toegestuurd hebt gekregen. Vraag een een nieuwe code aan. Vul hieronder nogmaals uw telefoonnummer in.',
    smsCodeUrl: formatSMSCodeUrl('phonenumber'),
    smsCodeText: "Dit is je code: [[code]]",
    smsCodeSender: "OpenStad",
    backbutton: true,
    displaySidebar: true,
    displayAccountLink:  false,
    defaultRoleId: memberRoleId,
  },
  {
    key: 'Url',
    label: 'E-mail een inloglink',
    loginUrl: formatLoginUrl('url'),
    displayBackbutton: true,
    displaySidebar: true,
    displayAccountLink:  false,
    defaultRoleId: memberRoleId,
  },
  {
    key: 'Anonymous',
    label: 'Anoniem inloggen',
    loginUrl: formatLoginUrl('anonymous'),
    errorMessage: 'Anoniem inloggen is niet gelukt',
    displayBackbutton: false,
    displaySidebar: false,
    displayAccountLink:  false,
    defaultRoleId: anonymousRoleId,
  },
  /*
  {
    key: 'DigiD',
    label: 'Digid code',
    loginUrl: formatLoginUrl('digid'),
    displayBackbutton: true,
    displaySidebar: false,
    displayAccountLink:  false,
  },
  */
];

const get = (key) => {
  const config = types.find(type => type.key === key);

  return config ? config : {};
}

exports.types = types;
exports.get = get;
