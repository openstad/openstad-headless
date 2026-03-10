'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {
  let RefreshToken = sequelize.define(
    'refresh_token',
    {
      tokenId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      clientID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      scope: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'refresh_tokens',
    }
  );

  return RefreshToken;
};
