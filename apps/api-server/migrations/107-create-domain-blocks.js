module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('domain_blocks', {
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
      domain: {
        type: require('sequelize').STRING,
        allowNull: false,
      },
      referer: {
        type: require('sequelize').STRING(2048),
        allowNull: true,
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
      'domain_blocks',
      ['projectId', 'widgetId', 'domain'],
      {
        unique: true,
        name: 'domain_blocks_unique',
      }
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('domain_blocks');
  },
};
