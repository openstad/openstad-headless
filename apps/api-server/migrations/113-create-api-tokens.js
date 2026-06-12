const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('api_tokens', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tokenHash: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      tokenPrefix: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      lastFour: {
        type: Sequelize.STRING(4),
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('api_tokens', ['tokenHash'], {
      name: 'idx_api_tokens_token_hash',
      unique: true,
    });

    await queryInterface.addIndex('api_tokens', ['userId'], {
      name: 'idx_api_tokens_user_id',
    });

    await queryInterface.addIndex('api_tokens', ['projectId'], {
      name: 'idx_api_tokens_project_id',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('api_tokens');
  },
};
