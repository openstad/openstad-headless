const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('image_resources', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      sort: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      typeId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      viewableByRole: {
        type: Sequelize.ENUM('admin', 'editor', 'moderator', 'member', 'anonymous', 'all'),
        defaultValue: 'all'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      budget: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      extraData: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true
      },
      modBreak: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      modBreakUserId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      modBreakDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      publishDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('image_resources');
  }
};
