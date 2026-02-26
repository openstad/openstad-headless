const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    queryInterface.createTable('access_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        default: null,
      },
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('access_codes');
  },
};
