'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let AccessCode = sequelize.define('access_code', {

    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

  }, {
    tableName: 'access_codes',
  });

  return AccessCode;

}

