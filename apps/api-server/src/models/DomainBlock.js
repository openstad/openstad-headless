module.exports = function (db, sequelize, DataTypes) {
  let DomainBlock = sequelize.define(
    'domain_block',
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      widgetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      referer: {
        type: DataTypes.STRING(2048),
        allowNull: true,
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
      tableName: 'domain_blocks',
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ['projectId', 'widgetId', 'domain'],
          name: 'domain_blocks_unique',
        },
      ],
    }
  );

  DomainBlock.associate = function (models) {
    DomainBlock.belongsTo(models.Project, { foreignKey: 'projectId' });
    DomainBlock.belongsTo(models.Widget, { foreignKey: 'widgetId' });
  };

  DomainBlock.auth = DomainBlock.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return DomainBlock;
};
