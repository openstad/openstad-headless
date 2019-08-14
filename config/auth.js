const formatLoginUrl = (slug) => {
  return `/auth/${slug}/login`;
}

const formatRegisterUrl = (slug) => {
  return `/auth/${slug}/register`;
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
  },
  {
    key: 'Local',
    label: 'Inlog via Wachtwoord',
    loginUrl: formatLoginUrl('local'),
    registerUrl: formatRegisterUrl('local'),
    backbutton: true,
    displaySidebar: true,
    displayAccountLink:  false,
  },
  {
    key: 'Url',
    label: 'E-mail een inloglink',
    loginUrl: formatLoginUrl('url'),
    displayBackbutton: true,
    displaySidebar: true,
    displayAccountLink:  false,
  },
  {
    key: 'Anonymous',
    label: 'Anoniem inloggen',
    loginUrl: formatLoginUrl('anonymous'),
    errorMessage: 'Anoniem inloggen is niet gelukt',
    displayBackbutton: false,
    displaySidebar: false,
    displayAccountLink:  false,
  },
  {
    key: 'DigiD',
    label: 'Digid code',
    loginUrl: formatLoginUrl('digid'),
    displayBackbutton: true,
    displaySidebar: false,
    displayAccountLink:  false,
  },
];

const get = (key) => {
  return types.find(type => type.key === key);
}

exports.types = types;
exports.get = get;
