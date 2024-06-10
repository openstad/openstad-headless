const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('tags', 'newSubmitAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'listIcon',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('tags', 'newSubmitAddress');
  }
};
