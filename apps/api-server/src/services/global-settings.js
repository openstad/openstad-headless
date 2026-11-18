const db = require('../db');

const GLOBAL_SETTINGS_ID = 1;

async function readGlobalSettings() {
  const globalSettings = await db.GlobalSettings.findByPk(GLOBAL_SETTINGS_ID);
  if (!globalSettings) {
    throw new Error(
      'The global settings row is missing; run the database migrations'
    );
  }
  return globalSettings;
}

function filled(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => !!value)
  );
}

function emailConfigDefaults(globalSettings) {
  const notifications = globalSettings.email?.notifications || {};
  return {
    notifications: filled({
      fromAddress: notifications.fromAddress,
      fromName: notifications.fromName,
      replyTo: notifications.replyTo,
    }),
    styling: filled({ accentColor: globalSettings.branding?.accentColor }),
  };
}

function authClientDefaults(globalSettings) {
  const login = globalSettings.email?.login || {};
  return {
    ...filled({
      fromEmail: login.fromAddress,
      fromName: login.fromName,
      contactEmail: login.helpAddress,
    }),
    styling: filled({
      logo: globalSettings.branding?.logo,
      favicon: globalSettings.branding?.favicon,
    }),
  };
}

module.exports = {
  readGlobalSettings,
  emailConfigDefaults,
  authClientDefaults,
};
