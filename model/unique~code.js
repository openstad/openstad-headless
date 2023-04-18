'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let UniqueCode = sequelize.define('unique_code', {

    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
    },

    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    tableName: 'unique_codes',
  });

  return UniqueCode;

}

