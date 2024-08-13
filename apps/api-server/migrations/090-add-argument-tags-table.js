'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comment_tags', {
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      commentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb3',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('comment_tags');
  }
};