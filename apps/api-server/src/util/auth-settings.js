const config = require('config');
const merge = require('merge');

let createProjectConfig = function({ project }) {
  
  let defaultConfig = config && config.auth || {};
  let temp = { provider: {}, adapter: {} };
  Object.keys(defaultConfig.provider).map( key => temp.provider[key] = {} );  // todo: defaultConfig is non-extensible, that's why this very not robust fix
  let apiAuthConfig = merge.recursive( temp, defaultConfig );

  let projectSpecificConfig = project && project.config && project.config.auth || {};

  return merge.recursive( apiAuthConfig, projectSpecificConfig )

}

let getConfig = async function({  project, useAuth = 'default' }) {

  let projectConfig = createProjectConfig({ project })

  if (useAuth == 'default' && projectConfig.default) useAuth = projectConfig.default;

  let authConfig = {
    provider: useAuth,
    jwtSecret: projectConfig.jwtSecret
  }

  let providerConfig = projectConfig.provider[ useAuth ] || {};
  let adapterConfig = projectConfig.adapter[ providerConfig.adapter ] || {};
  authConfig = merge.recursive( authConfig, adapterConfig );
  authConfig = merge.recursive( authConfig, providerConfig );

  if (authConfig.jwtSecret == 'REPLACE THIS VALUE!!') { // todo: move this to a place where is called once, not every request
    console.log('===========================');
    console.log('jwtSecret is not configured');
    console.log('¡¡ this should be fixed !!!');
    console.log('===========================');
  }

  return authConfig;

};

let getAdapter = async function({  authConfig, project, useAuth = 'default' }){

  authConfig = authConfig || await getConfig({  project, useAuth });

  try {
    let adapter = await require(process.env.NODE_PATH + '/' + authConfig.modulePath);
    return adapter;
  } catch(err) {
    console.log(err);
    throw new Error('Adapter not found');
  }

};

let getProviders = async function({ project }){

  let projectConfig = createProjectConfig({ project })
  let providers = Object.keys(projectConfig.provider);

  return providers;

};

module.exports = {
  config: getConfig,
  adapter: getAdapter,
  providers: getProviders,
}
