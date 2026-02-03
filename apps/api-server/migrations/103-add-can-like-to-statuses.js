const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('statuses', 'canLike', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('statuses', 'canLike');
  },
};
