const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('audit_logs', 'referer', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('audit_logs', 'referer');
  },
};
