const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('tags', 'detailPageUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'documentMapIconColor',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('tags', 'detailPageUrl');
  },
};
