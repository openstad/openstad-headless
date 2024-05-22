const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('votes', 'imageResourceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'image_resources',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addColumn('comments', 'imageResourceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'image_resources',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addColumn('statuses', 'imageResourceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'image_resources',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addColumn('resource_statuses', 'imageResourceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'image_resources',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addColumn('resource_tags', 'imageResourceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'image_resources',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addColumn('comments', 'location', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.changeColumn('votes', 'resourceId', {
      allowNull: true
    });

    await queryInterface.changeColumn('comments', 'resourceId', {
      allowNull: true
    });

    await queryInterface.changeColumn('statuses', 'resourceId', {
      allowNull: true
    });

    await queryInterface.changeColumn('resource_statuses', 'resourceId', {
      allowNull: true
    });

    await queryInterface.changeColumn('resource_tags', 'resourceId', {
      allowNull: true
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('votes', 'imageResourceId');
    await queryInterface.removeColumn('comments', 'imageResourceId');
    await queryInterface.removeColumn('comments', 'location');
    await queryInterface.removeColumn('statuses', 'imageResourceId');
    await queryInterface.removeColumn('resource_statuses', 'imageResourceId');
    await queryInterface.removeColumn('resource_tags', 'imageResourceId');

    await queryInterface.changeColumn('votes', 'resourceId', {
      allowNull: false
    });

    await queryInterface.changeColumn('comments', 'resourceId', {
      allowNull: false
    });

    await queryInterface.changeColumn('statuses', 'resourceId', {
      allowNull: false
    });

    await queryInterface.changeColumn('resource_statuses', 'resourceId', {
      allowNull: false
    });

    await queryInterface.changeColumn('resource_tags', 'resourceId', {
      allowNull: false
    });

  }
};
