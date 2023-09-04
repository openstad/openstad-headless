'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let ExternalCsrfToken = sequelize.define('external_csrf_token', {

    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    used: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    tableName: 'external_csrf_tokens',
  });

  return ExternalCsrfToken;

}

