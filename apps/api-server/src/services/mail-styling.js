const { authClientSettingsFor } = require('./auth-client-settings');

function createMailStyling({ authClientSettingsFor }) {
  async function mailLogoFor(project) {
    const brandLogo = project.emailConfig?.styling?.logo;
    if (brandLogo) return brandLogo;

    const authClientSettings = await authClientSettingsFor(project);
    return authClientSettings?.logo || project.config?.styling?.logo || '';
  }

  return async function mailStylingFor(project) {
    if (!project) return { logo: '', accentColor: '' };

    return {
      logo: await mailLogoFor(project),
      accentColor: project.emailConfig?.styling?.accentColor,
    };
  };
}

module.exports = {
  createMailStyling,
  mailStylingFor: createMailStyling({ authClientSettingsFor }),
};
