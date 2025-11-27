const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'comment_votes', 'opinion', {
      type: Sequelize.VARCHAR(64),
      allowNull: true,
      default: null,
      after: 'userId',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('comment_votes', 'opinion');
  }
};
