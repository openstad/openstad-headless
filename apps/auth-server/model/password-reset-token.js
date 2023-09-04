'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let PasswordResetToken = sequelize.define('password_reset_token', {

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
    tableName: 'password_reset_tokens',
  });

  return PasswordResetToken;

}

