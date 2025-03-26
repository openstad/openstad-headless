'use strict';

module.exports = (db, sequelize, DataTypes) => {
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
