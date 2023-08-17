'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let UserRole = sequelize.define('user_role', {

    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    tableName: 'user_roles',
    defaultScope: {
      include: db.Role,
    },
  });

  UserRole.associate = function (models) {
    this.belongsTo(db.Client);
    this.belongsTo(db.User);
    this.belongsTo(db.Role);
  }

  UserRole.scopes = function scopes() {
    return {
      includeRole: function() {
        return {
          include: [{
            model: db.Role,
          }],
          
        };
      },
      includeUser: function() {
        return {
          include: [{
            model: db.User,
          }],
          
        };
      },
      includeClient: function() {
        return {
          include: [{
            model: db.Client,
          }],
          
        };
      },
    }
  }

  return UserRole;

}

