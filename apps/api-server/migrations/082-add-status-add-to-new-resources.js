const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'statuses', 'addToNewResources', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      default: false,
      after: 'seqnr',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('statuses', 'addToNewResources');
  }
};
