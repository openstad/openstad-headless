const Sequelize = require('sequelize');
const merge = require('merge');
const configField = require('./lib/config-field');

// Single-row model holding the global project defaults (branding + e-mail settings).
module.exports = function (db, sequelize, DataTypes) {
  var SiteConfig = sequelize.define('site_config', {
    config: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      get: function () {
        let value = this.getDataValue('config');
        return configField.parseConfig('projectConfig', value);
      },
      set: function (value) {
        var currentConfig = this.getDataValue('config');
        value = value || {};
        value = merge.recursive(true, currentConfig, value);
        this.setDataValue(
          'config',
          configField.parseConfig('projectConfig', value)
        );
      },
      auth: {
        viewableBy: 'editor',
        updateableBy: 'admin',
      },
    },

    emailConfig: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      get: function () {
        let value = this.getDataValue('emailConfig');
        return configField.parseConfig('projectEmailConfig', value);
      },
      set: function (value) {
        var currentConfig = this.getDataValue('emailConfig');
        value = value || {};
        value = merge.recursive(true, currentConfig, value);
        this.setDataValue(
          'emailConfig',
          configField.parseConfig('projectEmailConfig', value)
        );
      },
      auth: {
        viewableBy: 'editor',
        updateableBy: 'admin',
      },
    },
  });

  // Editors read the settings to show what a project inherits; only admins may change them.
  SiteConfig.auth = SiteConfig.prototype.auth = {
    listableBy: 'editor',
    viewableBy: 'editor',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return SiteConfig;
};
