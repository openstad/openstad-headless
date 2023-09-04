'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let AccessToken = sequelize.define('access_token', {

    tokenId: {
      type: DataTypes.STRING,
      allowNull: false,
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
      allowNull: false,
      set: function (value) {
        console.log(value);
        if (Array.isArray(value)) value = value[0];
        this.setDataValue('scope', value);
      },
    },

    expirationDate: {
      type: Sequelize.DATE, 
      defaultValue: Sequelize.NOW 
    },

  }, {
    tableName: 'access_tokens',
  });

  return AccessToken;

}

