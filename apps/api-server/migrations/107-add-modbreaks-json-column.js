const { Sequelize } = require('sequelize');
const crypto = require('crypto');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('resources', 'modBreaks', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'modBreakDate',
    });

    const [resources] = await queryInterface.sequelize.query(
      `SELECT id, modBreak, modBreakDate, createdAt
       FROM resources
       WHERE modBreak IS NOT NULL AND modBreak != ''`
    );

    for (const resource of resources) {
      const date = resource.modBreakDate
        ? new Date(resource.modBreakDate).toISOString()
        : new Date(resource.createdAt).toISOString();

      const entry = {
        id: crypto.randomUUID(),
        description: resource.modBreak,
        authorName: null,
        modBreakDate: date,
        createdAt: date,
      };

      await queryInterface.sequelize.query(
        `UPDATE resources SET modBreaks = ? WHERE id = ?`,
        { replacements: [JSON.stringify([entry]), resource.id] }
      );
    }
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('resources', 'modBreaks');
  },
};
