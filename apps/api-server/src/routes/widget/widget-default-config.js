function getDefaultConfig(project, widgetType, apiConfig) {
  const forceNewLogin = project.config?.auth?.forceNewLoginOnWidgets
    ? '&forceNewLogin=1'
    : '';
  const loginUrl = `${apiConfig.url}/auth/project/${project.id}/login?useAuth=default${forceNewLogin}&redirectUri=[[REDIRECT_URI]]`;
  const loginUrlAnonymous = `${apiConfig.url}/auth/project/${project.id}/login?useAuth=anonymous${forceNewLogin}&redirectUri=[[REDIRECT_URI]]`;
  const logoutUrl = `${apiConfig.url}/auth/project/${project.id}/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]`;

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

  return result;
}

module.exports = getDefaultConfig;
