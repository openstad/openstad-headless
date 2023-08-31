'use strict';

const { DataTypes } = require('sequelize');
const sanitize = require('../utils/sanitize')

module.exports = (db, sequelize, Sequelize) => {

  let User = sequelize.define('user', {

    firstName: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('firstName', value || null);
      },
    },

    lastName: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('lastName', value || null);
      },
    },

    email: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('email', value || null);
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('phoneNumber', value || null);
      },
    },

    hashedPhoneNumber: {
      type: DataTypes.STRING,
    },

    phoneNumberConfirmed: {
      type: DataTypes.BOOLEAN,
      default: 0,
    },

    streetName: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('streetName', value || null);
      },
    },

    houseNumber: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('houseNumber', value || null);
      },
    },

    city: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('city', value || null);
      },
    },

    suffix: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('suffix', value || null);
      },
    },

    postcode: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('postcode', value || null);
      },
    },

    password: {
      type: DataTypes.STRING,
    },

    resetPasswordToken: {
      type: DataTypes.STRING,
    },

    twoFactorToken: {
      type: DataTypes.STRING,
    },

    twoFactorConfigured: {
      type: DataTypes.INTEGER,
    },

  }, {
    tableName: 'users',
  });

  User.associate = function (models) {
    this.hasMany(db.UserRole, { as: 'roles' });
  }

  User.prototype.getRoleForClient = function(clientId) {
    let self = this;
    return db.UserRole
      .scope('includeClient', 'includeRole')
      .findAll({
        where: { userId: self.id }
      })
      .then(userRoles => {
        let userRole = userRoles.find( userRole => userRole.client.clientId == clientId );
        let role = userRole?.role;
        return role?.name
      })
  }

  User.scopes = function scopes() {

    return {

      includeUserRoles: {
        include: 'roles',
      }

    }
  }

  return User;

}

