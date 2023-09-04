'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let LoginToken = sequelize.define('login_token', {

    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    valid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    tableName: 'login_tokens',
  });

  return LoginToken;

}

