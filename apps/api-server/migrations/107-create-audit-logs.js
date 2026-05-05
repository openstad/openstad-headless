const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      userName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      userRole: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      action: {
        type: Sequelize.ENUM(
          'create',
          'read',
          'update',
          'delete',
          'login',
          'login_failed',
          'logout',
          'register',
          'password_reset',
          '2fa_configured',
          '2fa_failed'
        ),
        allowNull: false,
      },
      modelName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      modelId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      previousData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      newData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      hostname: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      routePath: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      statusCode: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
      source: {
        type: Sequelize.ENUM('api', 'auth'),
        allowNull: false,
        defaultValue: 'api',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex(
      'audit_logs',
      ['modelName', 'modelId', 'createdAt'],
      {
        name: 'idx_audit_model_created',
      }
    );

    await queryInterface.addIndex('audit_logs', ['userId', 'createdAt'], {
      name: 'idx_audit_user_created',
    });

    await queryInterface.addIndex('audit_logs', ['projectId', 'createdAt'], {
      name: 'idx_audit_project_created',
    });

    await queryInterface.addIndex('audit_logs', ['createdAt'], {
      name: 'idx_audit_created',
    });

    await queryInterface.addIndex('audit_logs', ['source', 'createdAt'], {
      name: 'idx_audit_source_created',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('audit_logs');
  },
};
