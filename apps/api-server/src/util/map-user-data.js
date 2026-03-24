const db = require('../db');

module.exports = function mapUserData({ map = {}, user = {} }) {
  if (typeof map == 'string') {
    try {
      map = JSON.parse(map);
    } catch (err) {
      console.log(err);
    }
  }

  if (typeof map == 'function') {
    return map(user);
  }

  let result = {
    idpUser: {
      identifier: mapKey('identifier'),
      accesstoken: user.accessToken,
    },
    // projectId: user.projectId,

    lastLogin: new Date(),
    isNotifiedAboutAnonymization: null,
  };

  // role only if mapped
  if (map.role) {
    result.role = mapKey('role');
  }

  // do mapping
  let keys = [
    'email',
    'nickName',
    'name',
    'phoneNumber',
    'address',
    'postcode',
    'city',
    'twoFactorConfigured',
    'emailNotificationConsent',
    'clientId',
  ];
  for (let key of keys) {
    result[key] = mapKey(key);
  }

  // Combine streetName + houseNumber into address when mapped separately
  if (!result.address && (map.streetName || map.houseNumber)) {
    const street = map.streetName ? user[map.streetName] : null;
    const house = map.houseNumber ? user[map.houseNumber] : null;
    result.address = [street, house].filter(Boolean).join(' ').trim() || null;
  }

  // Map extraData.* keys into the extraData object
  const extraData = {};
  for (const [key, attr] of Object.entries(map)) {
    if (key.startsWith('extraData.') && attr) {
      const subKey = key.slice('extraData.'.length);
      extraData[subKey] = user[attr] ?? null;
    }
  }
  if (Object.keys(extraData).length > 0) {
    result.extraData = extraData;
  }

  return result;

  function mapKey(key) {
    let propMap = map[key];

    if (!propMap) return user[key];

    if (typeof propMap == 'string') {
      try {
        // function?
        propMap = eval(propMap);
      } catch (err) {}
    }

    if (typeof propMap == 'function') {
      return propMap(user, key);
    }

    return user[propMap];
  }
};
