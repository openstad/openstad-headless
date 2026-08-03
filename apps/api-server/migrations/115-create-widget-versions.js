module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('widget_versions', {
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
      widgetId: {
        type: require('sequelize').INTEGER,
        allowNull: false,
        references: { model: 'widgets', key: 'id' },
        onDelete: 'CASCADE',
      },
      config: {
        type: require('sequelize').JSON,
        allowNull: false,
      },
      userId: {
        type: require('sequelize').INTEGER,
        allowNull: true,
      },
      userName: {
        type: require('sequelize').STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: require('sequelize').DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'widget_versions',
      ['widgetId', 'createdAt'],
      {
        name: 'widget_versions_widget_created',
      }
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('widget_versions');
  },
};
