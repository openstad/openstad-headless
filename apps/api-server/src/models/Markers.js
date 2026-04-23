const sanitize = require('../util/sanitize');

module.exports = function (db, sequelize, DataTypes) {
  let Markers = sequelize.define(
    'markers',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        set: function (text) {
          this.setDataValue('name', sanitize.title(String(text || '').trim()));
        },
      },

      markers: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
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
    {
      paranoid: true,
    }
  );

  Markers.scopes = function scopes() {
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

  Markers.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  };

  Markers.auth = Markers.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'editor',
    updateableBy: 'editor',
    deleteableBy: 'editor',
  };

  return Markers;
};
