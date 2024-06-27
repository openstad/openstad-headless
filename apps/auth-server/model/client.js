'use strict';

const { DataTypes } = require('sequelize');
const configAuthTypes = require('../config/auth.js').types;

module.exports = (db, sequelize, Sequelize) => {

  let Client = sequelize.define('client', {

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    redirectUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    clientId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    clientSecret: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    authTypes: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
      get: function () {
        let value = this.getDataValue('authTypes') || [];
        try {
          value = JSON.parse(value)
        } catch(err) {}
        return value;
      },
      set: function (value) {
        try {
          value = JSON.parse(value)
        } catch(err) {}
        value = value || [];
        this.setDataValue('authTypes', value);
      },
    },

    exposedUserFields: {
      type: DataTypes.JSON,
      defaultValue: [],
      get: function () {
        let value = this.getDataValue('exposedUserFields');
        try {
          value = JSON.parse(value)
        } catch(err) {}
        return value;
      },
      set: function (value) {
        try {
          value = JSON.parse(value)
        } catch(err) {}
        value = value || [];
        this.setDataValue('exposedUserFields', value);
      },
    },

    requiredUserFields: {
      type: DataTypes.JSON,
      defaultValue: [],
      get: function () {
        let value = this.getDataValue('requiredUserFields');
        try {
          value = JSON.parse(value)
        } catch(err) {}
        return value;
      },
      set: function (value) {
        try {
          value = JSON.parse(value)
        } catch(err) {}
        value = value || [];
        this.setDataValue('requiredUserFields', value);
      },
    },

    allowedDomains: {
      type: DataTypes.JSON,
      defaultValue: [],
      get: function () {
        let value = this.getDataValue('allowedDomains');
        try {
          value = JSON.parse(value)
        } catch(err) {}
        return value;
      },
      set: function (value) {
        try {
          value = JSON.parse(value)
        } catch(err) {}
        value = value || [];
        this.setDataValue('allowedDomains', value);
      },
    },

    config: {
      type: DataTypes.JSON,
      defaultValue: {},
      get: function () {
        let value = this.getDataValue('config');
        try {
          value = JSON.parse(value)
        } catch(err) {}
        return value;
      },
      set: function (value) {
        try {
          value = JSON.parse(value)
        } catch(err) {}
        value = value || {};
        this.setDataValue('config', value);
      },
    },

    twoFactorRoles: {
      type: DataTypes.JSON,
      defaultValue: [],
      get: function () {
        let value = this.getDataValue('twoFactorRoles');
        try {
          value = JSON.parse(value)
        } catch(err) {}
        return value;
      },
      set: function (value) {
        try {
          value = JSON.parse(value)
        } catch(err) {}
        value = value || [];
        this.setDataValue('twoFactorRoles', value);
      },
    },

  }, {
    
    tableName: 'clients',

  });

  Client.associate = function (models) {
    this.hasMany(db.UserRole);
  }

  Client.scopes = function scopes() {
    return {
      includeUserRoles: function() {
        return {
          include: db.UserRole,
        };
      }
    }
  }

  return Client;

}

