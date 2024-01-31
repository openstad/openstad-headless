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
      console.log(response);
      throw new Error('Fetch failed')
    }

    let userData = await response.json();

    if (!userData) return;

    let mappedUserData = service.fetchUserData({ authConfig, userId: userData.id });
    return mappedUserData;

  } catch(err) {
    console.log(err);
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
      console.log(response);
      throw new Error('Fetch failed')
    }

    let userData = await response.json();
    if (!userData) return;

    let mappedUserData = service.fetchUserData({ authConfig, userId: userData.id });
    return mappedUserData;

  } catch(err) {
    console.log(err);
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
      console.log(response);
      throw new Error('Fetch failed')
    }

    return await response.json();

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }

}

service.createClient = async function({ authConfig, project }) {

  // sync only configuration that is used by the OpenStad auth server - compare updateConfig below
  let newConfig = {
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
        siteUrl: `${project.url}`,
        redirectUrl: `${config.url}`,
        allowedDomains: [ config.domain ],
        name: `${project.name}`,
        description: `Client for API project ${project.name} (${project.id})`,
        config: newConfig
      }),
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('OpenStad.service.createClient: create client failed')
    }

    let client = response.json();
    return client;

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }

}

service.updateClient = async function({ authConfig, project }) {

  let clientId = authConfig.clientId;
  if (!clientId) {
    console.log('OpenStad.service.updateClient: clientId not found')
    return; // this step is optional; log but do not throw errors
  }

  // sync only configuration that is used by the OpenStad auth server
  let newConfig = {
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

  // onderstaande worden gebruikt door de auth server maar zaten niet in de sync; moet dat nu wel?

  // res.locals.clientProjectUrl = clientConfig.projectUrl;
  // res.locals.clientEmail = clientConfig.contactEmail;
  // res.locals.clientDisclaimerUrl = clientConfig.clientDisclaimerUrl;
  // res.locals.clientStylesheets = clientConfig.clientStylesheets;
  //
  // const transporterConfig = clientConfig.smtpTransport ? clientConfig.smtpTransport : {};
  //
  // emailLogo = clientConfig.emailLogo;
  // fromEmail: clientConfig.fromEmail,
  // fromName: clientConfig.fromName,
  //
  // clientConfig.emailRedirectUrl
  // title: configAuthType.title ? configAuthType.title : authLocalConfig.title,
  // description: configAuthType.description ?  configAuthType.description : authLocalConfig.description,
  // emailLabel: configAuthType.emailLabel ?  configAuthType.emailLabel : authLocalConfig.emailLabel,
  // passwordLabel: configAuthType.passwordLabel ?  configAuthType.passwordLabel : authLocalConfig.passwordLabel,
  // helpText: configAuthType.helpText ? configAuthType.helpText : authLocalConfig.helpText,
  // buttonText: configAuthType.buttonText ? configAuthType.buttonText : authLocalConfig.buttonText,
  // forgotPasswordText: configAuthType.forgotPasswordText ? configAuthType.forgotPasswordText : authLocalConfig.forgotPasswordText,
  // displaySidebar: configAuthType.displaySidebar ? configAuthType.displaySidebar : authCodeConfig.displaySidebar,
  // subtitle: configAuthType.loginSubtitle || authPhonenumberConfig.loginSubtitle,
  // label: configAuthType.label ?  configAuthType.label : authCodeConfig.label,
  // backUrl: authCodeConfig.displayBackbutton ? backUrl : false,
  //
  // config.requiredUserFields
  // config.twoFactor

  try {

    // fetch client
    let url = `${authConfig.serverUrlInternal}/api/admin/client/${clientId}`;
    let response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
      },
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('OpenStad.service.updateClient: fetch client failed')
    }

    let client = await response.json();
    let clientConfig = client.config;
    let config = merge.recursive({}, clientConfig, newConfig);

    // update client
    response = await fetch(url, {
	    headers: {
        Authorization: `Basic ${new Buffer(`${authConfig.clientId}:${authConfig.clientSecret}`).toString('base64')}`,
        'Content-type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify({ config }),
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('OpenStad.service.updateClient: update client failed')
    }

  } catch(err) {
    console.log(err);
    throw new Error('Cannot connect to auth server');
  }
  
}

module.exports = service;
