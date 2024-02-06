const sanitize = require('../util/sanitize');

module.exports = function (db, sequelize, DataTypes) {
  const Widget = sequelize.define('widgets', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    config: {
      type: DataTypes.JSON,
      default: {},
      allowNull: false,
    },
  });

  Widget.auth = Widget.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'moderator',
    updateableBy: ['moderator', 'owner'],
    deleteableBy: ['moderator', 'owner'],
  };

  Widget.scopes = function scopes() {
    return {};
  };

  Widget.associate = function (models) {
    this.belongsTo(models.Project, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: 'cascade',
    });

    this.hasMany(models.Submission, {
      foreignKey: {
        name: 'widgetId',
        onDelete: 'NULL',
        onUpdate: 'CASCADE',
      },
    });
  };
  return Widget;
};
