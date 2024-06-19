const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('tags', 'useDifferentSubmitAddress', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      default: false,
      after: 'listIcon',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('tags', 'useDifferentSubmitAddress');
  }
};
