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
	  headers = { Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}` };
  }

  if ( email  ) {
    path = `/api/admin/users?email=${encodeURIComponent(email)}`;
	  headers = { Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}` };
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
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
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
  const unmapUserData = (userData) => {
    // make copy
    let unmapped = JSON.parse(JSON.stringify(userData));
    if(typeof unmapped?.address !== 'undefined' && unmapped?.address !== null) {
      // Check if we can split the address into street and number
      const addressParts = unmapped.address.split(' ');
      if(addressParts.length > 1) {
        unmapped.streetName = addressParts.slice(0, -1).join(' ');
        unmapped.houseNumber = addressParts.slice(-1).join(' ');
      }else{
        unmapped.streetName = userData.address;
      }

      // Check displayName (nickName)
      if(typeof unmapped?.displayName !== 'undefined' && unmapped?.displayName !== null) {
        unmapped.nickName = unmapped.displayName;
      }
    }
    return unmapped
  }

  userData = unmapUserData(userData);

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
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
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
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
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
    throw new Error('OpenStad.service.fetchClient: clientId not found')
  }

  try {

    let url = `${authConfig.serverUrlInternal}/api/admin/client/${clientId}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
      },
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.fetchClient: fetch client failed')
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
        Authorization: `Basic ${Buffer.from(`${adminAuthConfig.clientId}:${adminAuthConfig.clientSecret}`).toString('base64')}`,
        'Content-type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify({
        authTypes,
        requiredUserFields,
        twoFactorRoles,
        siteUrl: project.url || '',
        redirectUrl: config.url || '',
        allowedDomains: [ config.domain ],
        name: authConfig.name || project.name || '',
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
        logo: authConfig?.config?.styling?.logo || project.config.styling?.logo,
        favicon: authConfig?.config?.styling?.favicon || project.config.styling?.favicon,
        inlineCSS: project.config.styling?.inlineCSS,
        displayClientName: project.config.styling?.displayClientName,
      },
      authTypes: {
        UniqueCode: merge({}, client.config?.authTypes?.UniqueCode, authConfig.config?.UniqueCode),
        Url: merge({}, client.config?.authTypes?.Url, authConfig.config?.Url),
        Phonenumber: merge({}, client.config?.authTypes?.Phonenumber, authConfig.config?.Phonenumber),
        Local: merge({}, client.config?.authTypes?.Local, authConfig.config?.Local),
      }
    };
    // Update these properties (if they exist in the authConfig or client config), else keep the existing value
    const properties = ['fromEmail', 'fromName', 'contactEmail', 'defaultRoleId', 'requiredFields', 'twoFactor', 'configureTwoFactor'];
    properties.forEach(property => {
      if (authConfig?.config && authConfig.config[property]) {
        newClientConfig[property] = authConfig.config[property];
      } else if (client?.config && client.config[property]) {
        newClientConfig[property] = client.config[property];
      }
    });

    let clientConfig = client.config;
    data.config = merge.recursive({}, clientConfig, newClientConfig);

    // Update allowedDomains if exists
    if(typeof  project.config.allowedDomains !== 'undefined' && project.config.allowedDomains.length > 0) {
      data.allowedDomains = project.config.allowedDomains;
    }
    
    // update client
    let url = `${authConfig.serverUrlInternal}/api/admin/client/${clientId}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
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

service.fetchUniqueCode = async function({ authConfig }) {

  let clientId = authConfig.clientId;
  if (!clientId) {
    throw new Error('OpenStad.service.fetchUniqueCodes: clientId not found')
  }

  try {

    let url = `${authConfig.serverUrlInternal}/api/admin/unique-codes?clientId=${clientId}&amount=3`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
      },
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.fetchUniqueCodes: fetch client failed')
    }
    let codes = await response.json();
    return codes;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }
}

service.createUniqueCode = async function({ authConfig, amount }) {

  let clientId = authConfig.clientId;
  if (!clientId) {
    throw new Error('OpenStad.service.createUniqueCodes: clientId not found')
  }

  try {

    let url = `${authConfig.serverUrlInternal}/api/admin/unique-code?clientId=${clientId}&amount=${amount}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
      },
      method: 'post',
      body: '{}',
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.createUniqueCodes: fetch client failed')
    }
    let result = await response.json();
    return result;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }
}


service.resetUniqueCode = async function({ authConfig, uniqueCodeId }) {

  let clientId = authConfig.clientId;
  if (!clientId) {
    throw new Error('OpenStad.service.createUniqueCodes: clientId not found')
  }

  if (!uniqueCodeId) {
    throw new Error('OpenStad.service.resetUniqueCodes: uniqueCodeId not found')
  }

  try {

    let url = `${authConfig.serverUrlInternal}/api/admin/unique-code/${uniqueCodeId}/reset?clientId=${clientId}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
      },
      method: 'post',
      body: '{}',
    })
    if (!response.ok) {
      throw new Error('OpenStad.service.resetUniqueCodes: fetch client failed')
    }
    let result = await response.json();
    return result;

  } catch(err) {
    throw new Error('Cannot connect to auth server');
  }
}

module.exports = service;
