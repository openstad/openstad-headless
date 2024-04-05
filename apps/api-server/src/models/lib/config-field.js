const configOptions = {
  projectConfig: require('./project-config'),
  projectEmailConfig: require('./project-emailconfig'),
}

function parseConfig(which, config) {

  try {
    if (typeof config == 'string') {
      config = JSON.parse(config);
    }
  } catch (err) {
    config = {};
  }

  let options = configOptions[which];

  config = checkValues(config, options)
  
  return config;

  function checkValues(value, options) {

    let newValue = {};
    Object.keys(options).forEach(key => {

      // TODO: 'arrayOfObjects' met een subset

      // objects in objects
      if (options[key].type == 'object' && options[key].subset) {
        let temp = checkValues(value[key] || {}, options[key].subset); // recusion
        return newValue[key] = Object.keys(temp) ? temp : undefined;
      }

      // objects in objects
      if (options[key].type == 'objectsInObject' && options[key].subset && value[key]) {
        newValue[key] = {};
        let elementkeys = Object.keys(value[key]);
        for (let i = 0; i < elementkeys.length; i++) {
          let elementkey = elementkeys[i];
          if (value[key][elementkey] == null) {
          } else {
            let temp = checkValues(value[key][elementkey] || {}, options[key].subset); // recusion
            newValue[key][elementkey] = Object.keys(temp) ? temp : undefined;
          }
        }
        return newValue[key];
      }

      // TODO: in progress
      if (typeof value[key] != 'undefined' && value[key] != null) {
        if (options[key].type && options[key].type === 'int' && parseInt(value[key]) !== value[key]) {
          throw new Error(`project.config: ${key} must be an int`);
        }
        if (options[key].type && options[key].type === 'string' && typeof value[key] !== 'string') {
          throw new Error(`project.config: ${key} must be an string`);
        }
        if (options[key].type && options[key].type === 'boolean' && typeof value[key] !== 'boolean') {
          throw new Error(`project.config: ${key} must be an boolean ${value[key]}, ${options}, ${typeof value[key]}`);
        }
        if (options[key].type && options[key].type === 'object' && typeof value[key] !== 'object') {
          throw new Error(`project.config: ${key} must be an object`);
        }
        if (options[key].type && options[key].type === 'arrayOfStrings' && !(typeof value[key] === 'object' && Array.isArray(value[key]) && !value[key].find(val => typeof val !== 'string'))) {
          throw new Error(`project.config: ${key} must be an array of strings`);
        }
        if (options[key].type && options[key].type === 'arrayOfNumbers' && !(typeof value[key] === 'object' && Array.isArray(value[key]) && !value[key].find(val => typeof val !== 'number'))) {
          throw new Error(`project.config: ${key} must be an array of numbers`);
        }
        if (options[key].type && options[key].type === 'arrayOfObjects' && !(typeof value[key] === 'object' && Array.isArray(value[key]) && !value[key].find(val => typeof val !== 'object'))) {
          throw new Error(`project.config: ${key} must be an array of objects`);
        }
        if (options[key].type && options[key].type === 'enum' && options[key].values && options[key].values.indexOf(value[key]) == -1) {
          throw new Error(`project.config: ${key} has an invalid value`);
        }
        return newValue[key] = value[key];
      }

      // default?
      if (typeof options[key].default != 'undefined') {
        return newValue[key] = options[key].default
      }

      // set to null
      if (value[key] == null) {
        newValue[key] = value[key] = undefined;
      }

      // allowNull?
      if (!newValue[key] && options[key].allowNull === false) {
        throw new Error(`project.config: $key must be defined`);
      }

      return newValue[key];

    });

    // voor nu mag je er in stoppen wat je wilt; uiteindelijk moet dat zo gaan werken dat je alleen bestaande opties mag gebruiken
    // dit blok kan dan weg
    Object.keys(value).forEach(key => {
      if (typeof newValue[key] == 'undefined') {
        newValue[key] = value[key];
      }
    });

    return newValue;

  }

}

module.exports = {
  parseConfig,
};

