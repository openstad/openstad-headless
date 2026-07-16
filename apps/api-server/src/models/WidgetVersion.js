module.exports = function (db, sequelize, DataTypes) {
  const WidgetVersion = sequelize.define(
    'widget_versions',
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      widgetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      config: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'widget_versions',
      timestamps: true,
      updatedAt: false,
      paranoid: false,
    }
  );

  WidgetVersion.auth = WidgetVersion.prototype.auth = {
    listableBy: ['editor', 'owner'],
    viewableBy: ['editor', 'owner'],
    createableBy: 'never',
    updateableBy: 'never',
    deleteableBy: 'never',
  };

  WidgetVersion.scopes = function scopes() {
    return {};
  };

  WidgetVersion.associate = function (models) {
    this.belongsTo(models.Widget, {
      foreignKey: {
        name: 'widgetId',
        allowNull: false,
      },
      onDelete: 'cascade',
    });

    this.belongsTo(models.Project, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: 'cascade',
    });
  };

  return WidgetVersion;
};
