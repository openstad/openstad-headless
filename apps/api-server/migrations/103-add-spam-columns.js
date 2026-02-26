const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('submissions', 'isSpam', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('choices_guide_results', 'isSpam', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('resources', 'isSpam', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('submissions', 'isSpam');
    await queryInterface.removeColumn('choices_guide_results', 'isSpam');
    await queryInterface.removeColumn('resources', 'isSpam');
  },
};
