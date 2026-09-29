'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {
  let AuthorizationCode = sequelize.define(
    'authorization_code',
    {
      tokenId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      clientID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      redirectURI: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },

      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      scope: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'authorization_codes',
    }
  );

  return AuthorizationCode;
};
