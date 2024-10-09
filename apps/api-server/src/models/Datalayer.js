const sanitize = require('../util/sanitize');
const config = require('config');

module.exports = function (db, sequelize, DataTypes) {
  let DataLayer = sequelize.define(
    'datalayers',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        set: function (text) {
          this.setDataValue('name', sanitize.title(text.trim()));
        },
      },

      layer: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },

      icon: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        default: null,
      },
    },
  );

  DataLayer.scopes = function scopes() {
    return {
      includeDeleted: {
        paranoid: false,
      },

      onlyWithIds: function (idList) {
        return {
          where: {
            id: idList,
          },
        };
      },
    };
  };

  // DataLayer.associate = function (models) {
  //   this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  // };

  DataLayer.auth = DataLayer.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'moderator',
    updateableBy: 'moderator',
    deleteableBy: 'moderator',
  };

  return DataLayer;
};
