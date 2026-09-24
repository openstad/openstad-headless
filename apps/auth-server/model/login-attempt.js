'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {
  let LoginAttempt = sequelize.define(
    'login_attempt',
    {
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'login_attempts',
      indexes: [
        { fields: ['clientId', 'createdAt'] },
        { fields: ['clientId', 'ip', 'createdAt'] },
      ],
    }
  );

  return LoginAttempt;
};
