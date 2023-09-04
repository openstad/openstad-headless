'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let Role = sequelize.define('role', {

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

  }, {
    tableName: 'roles',
  });

  Role.associate = function (models) {
    this.hasMany(db.UserRole);
  }

  return Role;

}

