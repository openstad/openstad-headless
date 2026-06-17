module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('widget_loads', {
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
      url: {
        type: require('sequelize').STRING(2048),
        allowNull: false,
      },
      urlHash: {
        type: require('sequelize').CHAR(64),
        allowNull: false,
      },
      count: {
        type: require('sequelize').INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      lastSeen: {
        type: require('sequelize').DATE,
        allowNull: false,
        defaultValue: require('sequelize').fn('NOW'),
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
      'widget_loads',
      ['projectId', 'widgetId', 'urlHash'],
      {
        unique: true,
        name: 'widget_loads_unique',
      }
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('widget_loads');
  },
};
