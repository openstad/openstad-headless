const fetch = require('node-fetch');
const merge = require('merge');
const mapUserData = require('../../util/map-user-data');
const authSettings = require('../../util/auth-settings');
const config = require('config');
const db = require('../../db');

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

  let url = `${authConfig.serverUrlInternal}${path}`;

  try {

    let response = await fetch(url, {
	    headers,
    })
    if (!response.ok) {
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
    throw new Error('Cannot connect to auth server');
  }

}

service.createUser = async function({ authConfig, userData = {} }) {

  // TODO: unmap userData

  if (userData.role) {
    // translate to what the auth server expects
    userData.roles = {
      [authConfig.clientId]: userData.role
    };
    delete userData.role;
  }

  let url = `${authConfig.serverUrlInternal}/api/admin/user?client_id=${authConfig.clientId}`;
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
      throw new Error('Fetch failed')
    }

    let userData = await response.json();

    if (!userData) return;

    let mappedUserData = service.fetchUserData({ authConfig, userId: userData.id });
    return mappedUserData;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }

}

service.updateUser = async function({ authConfig, userData = {} }) {

  // TODO: unmap userData

  if (!(userData && userData.id)) throw new Error('No user id found')

  if (userData.role) {
    // translate to what the auth server expects
    userData.roles = {
      [authConfig.clientId]: userData.role
    };
    delete userData.role;
  }

  let url = `${authConfig.serverUrlInternal}/api/admin/user/${userData.id}?client_id=${authConfig.clientId}`;
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
      throw new Error('Fetch failed')
    }

    let userData = await response.json();
    if (!userData) return;

    let mappedUserData = service.fetchUserData({ authConfig, userId: userData.id });
    return mappedUserData;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }

}

service.deleteUser = async function({ authConfig, userData = {} }) {

  // TODO: unmap userData

  if (!(userData && userData.id)) throw new Error('No user id found')

  let url = `${authConfig.serverUrlInternal}/api/admin/user/${userData.id}/delete?client_id=${authConfig.clientId}`;

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
      throw new Error('Fetch failed')
    }

    return await response.json();

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }

}

service.fetchClient = async function({ authConfig, project }) {

  let clientId = authConfig.clientId;
  if (!clientId) {
    throw new Error('OpenStad.service.updateClient: clientId not found')
  }

  try {

    let url = `${authConfig.serverUrlInternal}/api/admin/client/${clientId}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
      },
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.updateClient: fetch client failed')
    }
    let client = await response.json();
    return client;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }
}

service.createClient = async function({ authConfig, project }) {

  // sync only configuration that is used by the OpenStad auth server - compare updateConfig below
  let newConfig = {
    // requiredUserFields: project.config.usersrequiredUserFields
    users: {
      canCreateNewUsers: project.config.users?.canCreateNewUsers
    },
    styling: {
      logo: project.config.styling?.logo,
      favicon: project.config.styling?.favicon,
      inlineCSS: project.config.styling?.inlineCSS,
      displayClientName: project.config.styling?.displayClientName,
    }
  };

  try {

    // auth through admin project
    let adminProject = await db.Project.findByPk(config.admin.projectId);
    let adminAuthConfig = await authSettings.config({ project: adminProject, useAuth: 'openstad' });

    // create client
    let authTypes = authConfig.authTypes || ( authConfig.provider == 'openstad' && 'Url' ) || ( authConfig.provider == 'anonymous' && 'Anonymous' );
    if (!Array.isArray(authTypes)) authTypes = [ authTypes ];
    let twoFactorRoles = authConfig.twoFactorRoles || ( authConfig.provider == 'openstad' && ['admin'] );
    if (!Array.isArray(twoFactorRoles)) twoFactorRoles = [ authTypes ];
    let requiredUserFields = authConfig.requiredUserFields || ( authConfig.provider == 'openstad' && 'name' ) || ( authConfig.provider == 'anonymous' && 'postcode' )
    if (!Array.isArray(requiredUserFields)) requiredUserFields = [ requiredUserFields ];
    let url = `${adminAuthConfig.serverUrlInternal}/api/admin/client`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${adminAuthConfig.clientId}:${adminAuthConfig.clientSecret}`).toString('base64')}`,
        'Content-type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify({
        authTypes,
        requiredUserFields,
        twoFactorRoles,
        siteUrl: `${project.url}`,
        redirectUrl: `${config.url}`,
        allowedDomains: [ config.domain ],
        name: `${project.name}`,
        description: `Client for API project ${project.name} (${project.id})`,
        config: newConfig
      }),
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.createClient: create client failed')
    }

    let client = response.json();
    return client;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }

}

service.updateClient = async function({ authConfig, project }) {

  let clientId = authConfig.clientId;
  if (!clientId) {
    console.log('OpenStad.service.updateClient: clientId not found')
    return; // this step is optional; log but do not throw errors
  }

  try {

    let client = await service.fetchClient({ authConfig, project });

    let authTypes = authConfig.authTypes || client.authTypes;
    if (!Array.isArray(authTypes)) authTypes = [ authTypes ];

    let requiredUserFields = authConfig.requiredUserFields || client.requiredUserFields;
    if (!Array.isArray(requiredUserFields)) requiredUserFields = [ requiredUserFields ];

    let twoFactorRoles = authConfig.twoFactorRoles || client.twoFactorRoles;
    if (!Array.isArray(twoFactorRoles)) twoFactorRoles = [ twoFactorRoles ];

    let data = {
      authTypes,
      requiredUserFields,
      twoFactorRoles,
      redirectUrl: `${config.url}`,
      allowedDomains: [ config.domain ],
      name: `${project.name}`,
      description: `Client for API project ${project.name} (${project.id})`,
    }

    // client config: sync only configuration that is used by the OpenStad auth server
    let newClientConfig = {
      users: {
        canCreateNewUsers: project.config.users?.canCreateNewUsers
      },
      styling: {
        logo: project.config.styling?.logo,
        favicon: project.config.styling?.favicon,
        inlineCSS: project.config.styling?.inlineCSS,
        displayClientName: project.config.styling?.displayClientName,
      },
      fromEmail: authConfig.config.fromEmail || client.config.fromEmail,
      fromName: authConfig.config.fromName || client.config.fromName,
      contactEmail: authConfig.config.contactEmail || client.config.contactEmail,
      defaultRoleId: authConfig.config.defaultRoleId || client.config.defaultRoleId,
      requiredFields: authConfig.config.requiredFields || client.config.requiredFields,
      twoFactor: authConfig.config.twoFactor || client.config.twoFactor,
      configureTwoFactor: authConfig.config.configureTwoFactor || client.config.configureTwoFactor,
      authTypes: {
        UniqueCode: authConfig.config?.UniqueCode || client.config?.authTypes?.UniqueCode,
        Url: authConfig.config?.Url || client.config?.authTypes?.Url,
        Phonenumber: authConfig.config?.Phonenumber || client.config?.authTypes?.Phonenumber,
        Local: authConfig.config?.Local || client.config?.authTypes?.Local,
      }
    };

    let clientConfig = client.config;
    data.config = merge.recursive({}, clientConfig, newClientConfig);

    // update client
    let url = `${authConfig.serverUrlInternal}/api/admin/client/${clientId}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
        'Content-type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.updateClient: update client failed')
    }

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }
  
}

module.exports = service;
