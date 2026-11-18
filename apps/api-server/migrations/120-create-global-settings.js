const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('global_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      branding: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      email: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    const now = new Date();
    await queryInterface.bulkInsert('global_settings', [
      { id: 1, branding: '{}', email: '{}', createdAt: now, updatedAt: now },
    ]);
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('global_settings');
  },
};
