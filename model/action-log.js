'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let ActionLog = sequelize.define('action_log', {

    method: {
      type: DataTypes.STRING,
    },

    action: {
      type: DataTypes.STRING,
    },

    name: {
      type: DataTypes.STRING,
    },

    value: {
      type: DataTypes.STRING,
    },

    ip: {
      type: DataTypes.STRING,
    },

    userId: {
      type: DataTypes.INTEGER,
    },

    clientId: {
      type: DataTypes.INTEGER,
    },

  }, {
    tableName: 'action_log',
  });

  return ActionLog;

}

