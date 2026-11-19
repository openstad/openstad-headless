const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('login_revocations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      provider: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      identifier: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      revokedAt: {
        type: Sequelize.DATE(3),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'login_revocations',
      ['provider', 'identifier'],
      {
        unique: true,
        name: 'login_revocations_unique',
      }
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('login_revocations');
  },
};
