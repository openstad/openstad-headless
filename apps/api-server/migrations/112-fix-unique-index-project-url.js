module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `UPDATE projects SET url = NULL WHERE url = '';`,
        { transaction }
      );

      const [deletedWithUrl] = await queryInterface.sequelize.query(
        `SELECT id, url, config FROM projects WHERE deletedAt IS NOT NULL AND url IS NOT NULL;`,
        { transaction }
      );

      for (const row of deletedWithUrl) {
        let config =
          typeof row.config === 'string'
            ? JSON.parse(row.config)
            : row.config || {};
        if (!config.project) config.project = {};
        config.project.archivedUrl = row.url;
        await queryInterface.sequelize.query(
          `UPDATE projects SET config = ?, url = NULL WHERE id = ?`,
          { replacements: [JSON.stringify(config), row.id], transaction }
        );
      }
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const [archived] = await queryInterface.sequelize.query(
        `SELECT id, config FROM projects WHERE deletedAt IS NOT NULL AND url IS NULL;`,
        { transaction }
      );

      for (const row of archived) {
        let config =
          typeof row.config === 'string'
            ? JSON.parse(row.config)
            : row.config || {};
        const archivedUrl = config?.project?.archivedUrl;
        if (archivedUrl) {
          delete config.project.archivedUrl;
          await queryInterface.sequelize.query(
            `UPDATE projects SET config = ?, url = ? WHERE id = ?`,
            {
              replacements: [JSON.stringify(config), archivedUrl, row.id],
              transaction,
            }
          );
        }
      }
    });
  },
};
