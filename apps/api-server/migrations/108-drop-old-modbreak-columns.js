const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    const [[{ unmigrated }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS unmigrated
       FROM resources
       WHERE (modBreak IS NOT NULL AND modBreak != '')
         AND (modBreaks IS NULL)`
    );

    if (unmigrated > 0) {
      throw new Error(
        `Cannot drop old modBreak columns: ${unmigrated} resources have modBreak data that was not migrated to modBreaks`
      );
    }

    await queryInterface.removeColumn('resources', 'modBreak');
    await queryInterface.removeColumn('resources', 'modBreakUserId');
    await queryInterface.removeColumn('resources', 'modBreakDate');
  },

  async down({ context: queryInterface }) {
    await queryInterface.addColumn('resources', 'modBreak', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'location',
    });
    await queryInterface.addColumn('resources', 'modBreakUserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'modBreak',
    });
    await queryInterface.addColumn('resources', 'modBreakDate', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'modBreakUserId',
    });

    const [resources] = await queryInterface.sequelize.query(
      `SELECT id, modBreaks FROM resources WHERE modBreaks IS NOT NULL`
    );

    for (const resource of resources) {
      const breaks =
        typeof resource.modBreaks === 'string'
          ? JSON.parse(resource.modBreaks)
          : resource.modBreaks;

      if (Array.isArray(breaks) && breaks.length > 0) {
        const first = breaks[0];
        await queryInterface.sequelize.query(
          `UPDATE resources SET modBreak = ?, modBreakDate = ? WHERE id = ?`,
          {
            replacements: [
              first.description,
              first.modBreakDate ? new Date(first.modBreakDate) : null,
              resource.id,
            ],
          }
        );
      }
    }
  },
};
