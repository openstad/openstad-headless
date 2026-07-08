const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.changeColumn('audit_logs', 'action', {
      type: Sequelize.STRING(50),
      allowNull: false,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.changeColumn('audit_logs', 'action', {
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
    });
  },
};
