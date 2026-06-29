'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {
  let Task = sequelize.define(
    'task',
    {
      taskId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      lastUpdateDate: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: 'tasks',
    }
  );

  return Task;
};
