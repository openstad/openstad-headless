const config = require('config');
const merge = require('merge');

module.exports = async function autconfig({  project, useAuth = 'default' }) {

  let defaultConfig = config && config.auth || {};
  let temp = { provider: {}, adapter: {} };
  Object.keys(defaultConfig.provider).map( key => temp.provider[key] = {} );  // todo: defaultConfig is non-extensible, that's why this very not robust fix
  let apiAuthConfig = merge.recursive( temp, defaultConfig );

  let projectConfig = project && project.config && project.config.auth || {};

  apiAuthConfig = merge.recursive( apiAuthConfig, projectConfig )

  if (useAuth == 'default' && apiAuthConfig.default) useAuth = apiAuthConfig.default;

  let authConfig = {
    provider: useAuth,
    jwtSecret: apiAuthConfig.jwtSecret
  }

  let providerConfig = apiAuthConfig.provider[ useAuth ] || {};
  let adapterConfig = apiAuthConfig.adapter[ providerConfig.adapter ] || {};
  authConfig = merge.recursive( authConfig, adapterConfig );
  authConfig = merge.recursive( authConfig, providerConfig );

  if (authConfig.jwtSecret == 'REPLACE THIS VALUE!!') { // todo: move this to a place where is called once, not every request
    console.log('===========================');
    console.log('jwtSecret is not configured');
    console.log('¡¡ this should be fixed !!!');
    console.log('===========================');
  }

  return authConfig;

}
