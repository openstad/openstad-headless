const merge = require('merge');

function normalizeConfigForOpenstadClientSync(configData = {}) {
  const normalizedConfig = merge.recursive({}, configData || {});
  const nestedAuthTypes =
    normalizedConfig && typeof normalizedConfig === 'object'
      ? normalizedConfig.authTypes || {}
      : {};

  ['Url', 'UniqueCode', 'Phonenumber', 'Local'].forEach((authTypeKey) => {
    if (
      typeof normalizedConfig[authTypeKey] === 'undefined' &&
      typeof nestedAuthTypes[authTypeKey] !== 'undefined'
    ) {
      normalizedConfig[authTypeKey] = nestedAuthTypes[authTypeKey];
    }
  });

  return normalizedConfig;
}

module.exports = {
  normalizeConfigForOpenstadClientSync,
};
