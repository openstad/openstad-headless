const fetch = require('node-fetch');
const merge = require('merge');
const mapUserData = require('../../util/map-user-data');

let service = {};

service.fetchUserData = async function fetchUserData({ authConfig, userId, email, accessToken, raw = false }) {

  let path = '';
  let headers = {};
  if ( userId ) {
    path = `/api/admin/user/${userId}?client_id=${authConfig.clientId}`;
	  headers = { Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}` };
  }

  if ( email  ) {
    path = `/api/admin/users?email=${encodeURIComponent(email)}`;
	  headers = { Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}` };
  }

  if ( accessToken ) {
    path = `/api/userinfo?client_id=${authConfig.clientId}`;
	  headers = { Authorization: `Bearer ${accessToken}` };
  }

  let url = `${authConfig.serverUrl}${path}`;

  try {

    let response = await fetch(url, {
	    headers,
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }

    let userData;
    let json = await response.json();
    if (json && json.data && json.data.length > 0) {
      userData = json.data[0];
    } else if (json.id) {
      userData = json;
    } else if (json.user_id) {
      userData = json;
    }
    
    if (raw) return userData;

    if (!userData) return;

    let mappedUserData = mapUserData({ map: authConfig.userMapping, user: { ...userData, accessToken } })
    mappedUserData.idpUser.provider = authConfig.provider;
    return mappedUserData;

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }

}

service.createUser = async function({ authConfig, userData = {} }) {

  // TODO: unmap userData

  let url = `${authConfig.serverUrl}/api/admin/user?client_id=${authConfig.clientId}`;
  let body = JSON.stringify(userData)

  try {

    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
        'Content-type': 'application/json',
      },
      method: 'post',
      body,
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }

    let userData = await response.json();

    if (!userData) return;

    let mappedUserData = mapUserData({ map: authConfig.userMapping, user: { ...userData } })
    mappedUserData.idpUser.provider = authConfig.provider;
    console.log(mappedUserData);
    return mappedUserData;

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }

}

service.updateUser = async function({ authConfig, userData = {} }) {

  // TODO: unmap userData

  if (!(userData && userData.id)) throw new Error('No user id found')

  let url = `${authConfig.serverUrl}/api/admin/user/${userData.id}?client_id=${authConfig.clientId}`;
  let body = JSON.stringify(userData)

  try {

    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
        'Content-type': 'application/json',
      },
      method: 'post',
      body,
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }

    let userData = await response.json();

    if (!userData) return;

    let mappedUserData = mapUserData({ map: authConfig.userMapping, user: { ...userData } })
    mappedUserData.idpUser.provider = authConfig.provider;
    return mappedUserData;

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }

}

service.deleteUser = async function({ authConfig, userData = {} }) {

  // TODO: unmap userData

  if (!(userData && userData.id)) throw new Error('No user id found')

  let url = `${authConfig.serverUrl}/api/admin/user/${userData.id}/delete?client_id=${authConfig.clientId}`;

  try {

    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
        'Content-type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify({}),
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }

    return await response.json();

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }

}




module.exports = service;
