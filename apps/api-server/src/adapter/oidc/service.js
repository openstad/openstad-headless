const fetch = require('node-fetch');
const mapUserData = require('../../util/map-user-data');

let service = {};

service.fetchUserData = async function fetchUserData({ authConfig, accessToken }) {

  let url = authConfig.serverUrl + authConfig.serverUserInfoPath;
  url = url.replace(/\[\[clientId\]\]/, authConfig.clientId);

  try {

    let response = await fetch(url, {
	    headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }

    let userData = await response.json();

    let mappedUserData = mapUserData({ map: authConfig.userMapping, user: { ...userData, accessToken } })
    mappedUserData.idpUser.provider = authConfig.provider;
    return mappedUserData;

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }

}

service.saveCodeVerifier = async function saveCodeVerifier({ codeVerifier }) {
  
  // const insertedRecord = await db.OidcCodeVerifier.create({ verifier: codeVerifier });
  try {

    let url = `${authConfig.serverUrlInternal}/api/save-code-verifier?verifier=${codeVerifier}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
      },
      method: 'post',
      body: '{}',
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.saveCodeVerifier: failed')
    }
    let result = await response.json();
    return result;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }
}

module.exports = service;
