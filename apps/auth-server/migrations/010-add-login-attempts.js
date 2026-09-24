const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('login_attempts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ip: {
        type: Sequelize.STRING,
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
    });
    await queryInterface.addIndex('login_attempts', ['clientId', 'createdAt']);
    await queryInterface.addIndex('login_attempts', [
      'clientId',
      'ip',
      'createdAt',
    ]);
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('login_attempts');
  },
};
