module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Set empty strings to NULL for proper unique constraint behavior
      await queryInterface.sequelize.query(
        `UPDATE projects SET url = NULL WHERE url = '';`,
        { transaction }
      );

      // Check for duplicates (case-insensitive, ignoring protocol, www, and trailing slashes)
      const [duplicates] = await queryInterface.sequelize.query(
        `
        SELECT
          LOWER(TRIM(TRAILING '/' FROM REPLACE(REPLACE(REPLACE(url, 'https://', ''), 'http://', ''), 'www.', ''))) as normalized_url,
          GROUP_CONCAT(id ORDER BY id) as project_ids,
          COUNT(*) as cnt
        FROM projects
        WHERE url IS NOT NULL
        GROUP BY normalized_url
        HAVING cnt > 1;
        `,
        { transaction }
      );

      if (duplicates.length > 0) {
        const details = duplicates
          .map(
            (dup) =>
              `  URL: ${dup.normalized_url} — Project IDs: ${dup.project_ids}`
          )
          .join('\n');
        throw new Error(
          'Cannot add unique index: duplicate project URLs exist.\n' +
            'Resolve these duplicates manually, then re-run migrations:\n' +
            details
        );
      }

      // No duplicates found, safe to add unique index.
      // MySQL allows multiple NULLs in a unique index.
      // Note: this index enforces exact uniqueness on the raw `url` column.
      // Normalized uniqueness (e.g. www.example.com == example.com) is enforced
      // at the application level by the checkUniqueUrl middleware.
      await queryInterface.addIndex('projects', ['url'], {
        unique: true,
        name: 'projects_url_unique',
        transaction,
      });
    });
  },

  async down({ context: queryInterface }) {
    // Note: does not restore NULLs back to empty strings — NULL is more correct
    // for "no URL" and the application already handles both.
    try {
      await queryInterface.removeIndex('projects', 'projects_url_unique');
    } catch (err) {
      // Defensive: index may not exist if a previous partial run was cleaned up manually
      console.warn(
        'Index projects_url_unique does not exist, skipping removal.'
      );
    }
  },
};
