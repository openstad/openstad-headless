module.exports = function (db, sequelize, DataTypes) {
  let ResourceLink = sequelize.define(
    'resource_link',
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      targetSource: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: 'resource_links',
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ['resourceId', 'targetSource', 'targetId'],
          name: 'resource_links_unique',
        },
        {
          fields: ['targetSource', 'targetId'],
          name: 'resource_links_target',
        },
      ],
    }
  );

  ResourceLink.associate = function (models) {
    ResourceLink.belongsTo(models.Project, { foreignKey: 'projectId' });
    ResourceLink.belongsTo(models.Resource, { foreignKey: 'resourceId' });
  };

  ResourceLink.auth = ResourceLink.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'editor',
    updateableBy: 'editor',
    deleteableBy: 'editor',
  };

  return ResourceLink;
};
