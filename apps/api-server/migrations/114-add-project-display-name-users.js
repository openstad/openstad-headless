const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'projectDisplayName', {
      type: Sequelize.STRING(64),
      allowNull: true,
      after: 'nickName',
      defaultValue: null,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'projectDisplayName');
  },
};
