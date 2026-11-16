const {
  shouldForceNewLoginByDefault,
} = require('@openstad-headless/lib/force-new-login');
const pluginExtensions = require('../../services/plugin-extensions');

function getDefaultConfig(project, widgetType, apiConfig) {
  const forceNewLogin = shouldForceNewLoginByDefault(project)
    ? '&forceNewLogin=1'
    : '';
  const loginUrl = `${apiConfig.url}/auth/project/${project.id}/login?useAuth=default${forceNewLogin}&redirectUri=[[REDIRECT_URI]]`;
  const loginUrlAnonymous = `${apiConfig.url}/auth/project/${project.id}/login?useAuth=anonymous${forceNewLogin}&redirectUri=[[REDIRECT_URI]]`;
  const logoutUrl = `${apiConfig.url}/auth/project/${project.id}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;
  const multiProjectLogin = process.env.MULTI_PROJECT_LOGIN === 'true';

  let url = process.env.IMAGE_APP_URL;
  let zipCodeAutofillApiUrl = process.env.ZIPCODE_AUTOFILL_API_URL;
  let zipCodeApiUrl = process.env.ZIPCODE_API_URL;

  let protocol = '';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
  }

  let result = {
    api: {
      url: apiConfig.url,
      multiProjectLogin,
    },
    login: {
      url: loginUrl,
      anonymous: {
        url: loginUrlAnonymous,
      },
    },
    logout: {
      url: logoutUrl,
    },
    multiProjectLogin,
    projectId: project.id,
    imageUrl: apiConfig.url + `/api/project/${project.id}/upload`,
    zipCodeApiUrl: zipCodeApiUrl || '',
    zipCodeAutofillApiUrl: zipCodeAutofillApiUrl || '',
    serverTime: new Date().toISOString(),
    gtmEnvironment: process.env.GTM_ENVIRONMENT || 'prod',
    randomSortRotationMs: Number(process.env.RANDOM_SORT_ROTATION_MS) || 0,
  };

  if (
    widgetType == 'resourcedetailmap' ||
    widgetType == 'resourcesmap' ||
    widgetType == 'editormap' ||
    widgetType == 'resourceform'
  ) {
    result.area = project.area?.polygon;
  }

  const pluginCapabilities = pluginExtensions.widgetPluginCapabilities(
    pluginExtensions.get(),
    widgetType
  );
  if (pluginCapabilities) {
    result.pluginCapabilities = pluginCapabilities;
  }

  return result;
}

module.exports = getDefaultConfig;
