'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize) => {
  return sequelize.define('auth_providers', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('oidc', 'saml'),
      allowNull: false,
      defaultValue: 'oidc',
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    }
  });
};
