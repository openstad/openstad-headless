module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('resource_links', {
      id: {
        type: require('sequelize').INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      projectId: {
        type: require('sequelize').INTEGER,
        allowNull: false,
        references: { model: 'projects', key: 'id' },
        onDelete: 'CASCADE',
      },
      resourceId: {
        type: require('sequelize').INTEGER,
        allowNull: false,
        references: { model: 'resources', key: 'id' },
        onDelete: 'CASCADE',
      },
      targetSource: {
        type: require('sequelize').STRING(64),
        allowNull: false,
      },
      targetId: {
        type: require('sequelize').STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: require('sequelize').DATE,
        allowNull: false,
      },
      updatedAt: {
        type: require('sequelize').DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'resource_links',
      ['resourceId', 'targetSource', 'targetId'],
      {
        unique: true,
        name: 'resource_links_unique',
      }
    );

    await queryInterface.addIndex(
      'resource_links',
      ['targetSource', 'targetId'],
      {
        name: 'resource_links_target',
      }
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('resource_links');
  },
};
