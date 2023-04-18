'use strict';

const { DataTypes } = require('sequelize');
const sanitize = require('../utils/sanitize')

module.exports = (db, sequelize, Sequelize) => {

  let User = sequelize.define('user', {

    firstName: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('firstName', value);
      },
    },

    lastName: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('lastName', value);
      },
    },

    email: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('email', value);
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('phoneNumber', value);
      },
    },

    extraData: {
      type: DataTypes.JSON,
      defaultValue: '{}',
      allowNull: false,
      get: function () {
        let value = this.getDataValue('extraData');
        try {
          value = JSON.parse(value)
        } catch(err) {}
        return value;
      },
      set: function (value) {
        try {
          value = JSON.parse(value)
        } catch(err) {}
        value = value || [];
        try {
          value = JSON.stringify(value)
          value = sanitize.noTags(value);
          value = JSON.parse(value);
        } catch(err) {}
        this.setDataValue('extraData', value);
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
        this.setDataValue('streetName', value);
      },
    },

    houseNumber: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('houseNumber', value);
      },
    },

    city: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('city', value);
      },
    },

    suffix: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('suffix', value);
      },
    },

    postcode: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('postcode', value);
      },
    },

    password: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('password', value);
      },
    },

    resetPasswordToken: {
      type: DataTypes.STRING,
      set: function (value) {
        value = sanitize.noTags(value);
        this.setDataValue('resetPasswordToken', value);
      },
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

      includeMe: {
        where: [{
          id: 123,
        }]
      },

      includeUserRoles: {
        include: 'roles',
      }

    }
  }

  return User;

}

