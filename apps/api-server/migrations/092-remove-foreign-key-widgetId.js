const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.removeConstraint('choices_guide_results', 'choices_guide_results_ibfk_1');
  },

  async down({ context: queryInterface }) {
    await queryInterface.addConstraint('choices_guide_results', {
      fields: ['widgetId'],
      type: 'foreign key',
      name: 'choices_guide_results_ibfk_1',
      references: {
        table: 'choices_guides',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
};