const mapUserData = require('../../util/map-user-data');

let service = {};

service.fetchUserData = async function fetchUserData({
  authConfig,
  accessToken,
}) {
  let url = authConfig.serverUrl + authConfig.serverUserInfoPath;
  url = url.replace(/\[\[clientId\]\]/, authConfig.clientId);

  try {
    let response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed');
    }

    let userData = await response.json();

    let mappedUserData = mapUserData({
      map: authConfig.userFieldMapping || authConfig.userMapping,
      user: { ...userData, accessToken },
    });
    mappedUserData.idpUser.provider = authConfig.provider;
    // Fall back to the standard OIDC `sub` claim if no identifier was mapped
    if (!mappedUserData.idpUser.identifier && userData.sub) {
      mappedUserData.idpUser.identifier = userData.sub;
    }
    // Default to member so the user is recognised as logged in by the CMS
    if (!mappedUserData.role) {
      mappedUserData.role = 'member';
    }
    return mappedUserData;
  } catch (err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }
};

module.exports = service;
