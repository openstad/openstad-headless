module.exports = function (db, sequelize, DataTypes) {
  let WidgetLoad = sequelize.define(
    'widget_load',
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      widgetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      urlHash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      lastSeen: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'widget_loads',
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ['projectId', 'widgetId', 'urlHash'],
          name: 'widget_loads_unique',
        },
      ],
    }
  );

  WidgetLoad.associate = function (models) {
    WidgetLoad.belongsTo(models.Project, { foreignKey: 'projectId' });
    WidgetLoad.belongsTo(models.Widget, { foreignKey: 'widgetId' });
  };

  WidgetLoad.auth = WidgetLoad.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return WidgetLoad;
};
