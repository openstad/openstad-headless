const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'score', {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: null,
      after: 'sort',
    });
    
    await queryInterface.addColumn( 'comments', 'score', {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: null,
      after: 'sentiment',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('resources', 'score');
    await queryInterface.removeColumn('comments', 'score');
  }
};
