const config = require('config');
const merge = require('merge');

let OAuthUser = {};

// these fields exist in the API but not in the oath server
let apiFieldsInExtraData = [ 'listableByRole', 'detailsViewableByRole', 'nickName', 'signedUpForNewsletter' ];

// todo: config uitbreiden en mergen
// doc: niet recursief want daar kan ik geen use case voor bedenken

let parseConfig = function(projectConfig) {

  // default config
  let config = {
    bio: { projectspecific: true },
    expertise: { projectspecific: true },
  };

  // these fields exist in the API but not in the oath server and are therefore project specific
  apiFieldsInExtraData.forEach(key => {
    config[key] = { projectspecific: true };
  });

  // merge with project config
  if (projectConfig && projectConfig.users && projectConfig.users.extraData) {
    config = merge.recursive(config, projectConfig.users.extraData)
  }

  config.id = projectConfig ? projectConfig.id : '';

  return config;
  
}

let parseData = function(projectId, config, value) {

  let result;
  let projectDataFound = false;

  if (Array.isArray(value)) {

    value.forEach(elem => {

      if (typeof elem == 'object' && elem != null && typeof elem.value != 'undefined' && elem.projectId) {
        projectDataFound = true;
        if (elem.projectId == projectId && config && config.projectspecific ) {
          result = elem.value
        }
      } else {
        if (!result) {
          result = elem;
        }
      }
    });

  }

  if (projectDataFound) {
    return result;
  } else {
    return value; // this is just an arrray
  }

}

OAuthUser.parseDataForProject = function(projectConfig, data) {

  let config = parseConfig(projectConfig);

  // extraData
  let cloned = merge(true, data.extraData) || {};
  let extraData = {};
  Object.keys(cloned).forEach(key => {
    extraData[key] = parseData(config.id, config[key], cloned[key]);
  });

  // split api fields
  apiFieldsInExtraData.forEach(key => {
    data[key] = extraData[key];
    delete extraData[key];
  });
  
  data.extraData = extraData;

  return data;

}

let mergeData = function(projectId, config, userValue, dataValue) {

  if (!(config && config.projectspecific)) return dataValue;

  let result = userValue;

  if (!Array.isArray(result)) result = [result];
  let found, foundIndex;
  result.forEach(( elem, index ) => {
    if (typeof elem == 'object' && elem != null && elem.value && elem.projectId && elem.projectId == projectId) {
      found = elem;
      foundIndex = index;
    }
  });

  if (found) {
    if (dataValue == null) {
      result.splice(foundIndex, 1);  // null means remove
    } else {
      found.value = dataValue;
    }
  } else {
    result.push({ projectId, value: dataValue })
  }

  return result;

}

OAuthUser.mergeDataForProject = function(projectConfig, user, data) {

  let config = parseConfig(projectConfig);

  // extraData
  let extraData = data.extraData || {};
  data.extraData = {};
  Object.keys(extraData).forEach(key => {
    data.extraData[key] = mergeData(config.id, config[key], user.extraData && user.extraData[key], extraData[key]);
  });

  // api fields
  apiFieldsInExtraData.forEach(key => {
    if (typeof data[key] != 'undefined') {
      data.extraData[key] = mergeData(config.id, config[key], user.extraData && user.extraData[key], data[key]);
    }
    delete data[key];
  });

  user = merge.recursive(true, user, data);
  return user;

}

module.exports = exports = OAuthUser;
