const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    queryInterface.createTable('resource_statuses', {
      statusId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      resourceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
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
        type: Sequelize.DATE,
        default: null,
      },
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.dropTable('resource_statuses');
  }

};
