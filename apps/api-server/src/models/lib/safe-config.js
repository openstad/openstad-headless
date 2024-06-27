// List of keys to be allowed in the safeConfig object
// You can use the dot notation (and *) to allow nested keys, e.g. 'provider.*.name' will allow 'provider.google.name' and 'provider.facebook.name'
const allowlist = [
  'auth.adapter',
  'auth.default',
  'auth.provider.*.adapter',
  'auth.provider.*.clientId',
  'resources.*',
  'polls.*',
  'users.*',
  'votes.*',
  'project.*',
  'widgets.*',
  'comments.*',
  'map.*',
];

function isInAllowlist(key) {
  return allowlist.some(allowKey => {
    const regex = new RegExp('^' + allowKey.replace('.', '\\.').replace('*', '.*') + '$');
    return regex.test(key);
  });
}

// Set a value in an object based on a path, e.g. 'a.b.c' => { a: { b: { c: value } } }
function setObjectValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!current[key]) {
      current[key] = {};
    }

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

// Get a safe config object based on the allowlist, this will return a subset of the config object
function getSafeConfig(config) {
  let safeConfig = {};

  // Functie om recursief door het object te lopen
  function recurse(obj, currentKey) {
    for (let key in obj) {
      const newKey = currentKey ? `${currentKey}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        recurse(obj[key], newKey);
      } else if (isInAllowlist(newKey)) {
        setObjectValue(safeConfig, newKey, obj[key]);
      }
    }
  }

  recurse(config, '');

  return safeConfig;
}

module.exports = {
  getSafeConfig
}
