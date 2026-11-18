const sanitize = require('../util/sanitize');

module.exports = function (db, sequelize, DataTypes) {
  let Template = sequelize.define(
    'template',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        set: function (text) {
          this.setDataValue('name', sanitize.title(String(text || '').trim()));
        },
      },

      // Snapshot of a project duplication payload: title, config, emailConfig,
      // areaId, widgets, tags, statuses, resources, notificationTemplates.
      data: {
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
    {
      paranoid: true,
    }
  );

  Template.auth = Template.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return Template;
};
