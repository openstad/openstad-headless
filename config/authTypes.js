const formatLoginUrl = (slug) => {
  return `/auth/${slug}/login`;
}

const formatRegisterUrl = (slug) => {
  return `/auth/${slug}/register`;
}
const types = {
  [
    key: 'UniqueCode',
    label: 'Unieke code',
    loginUrl: formatLoginUrl('code'),
  ],
  [
    key: 'Local',
    label: 'Inlog via Wachtwoord',
    loginUrl: formatLoginUrl('local'),
    registerUrl: formatRegisterUrl('local'),
  ],
  [
    key: 'Url',
    label: 'Inlog via URL',
    loginUrl: formatLoginUrl('url')
  ],
  [
    key: 'DigiD',
    label: 'Digid code',
    loginUrl: formatLoginUrl('digid'),
  ],
};

const get = (key) => {
  return types.find(type => type.key === key);
}

export.types = types;
export.get = get;
