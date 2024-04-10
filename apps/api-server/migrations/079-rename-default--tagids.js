const { Sequelize } = require('sequelize');
const db = require('../src/db');

module.exports = {
  async up ({ context: queryInterface }) {

    try {

      let projects = await db.Project.findAll();
      for (let project of projects) {

        let defaultTagIds = project.config?.resources?.tags || [];
        if (!Array.isArray(defaultTagIds)) defaultTagIds = [ defaultTagIds ];

        // rename
        let updated = { resources: {} };
        if (project.config?.resources.tags) updated.resources.tags = null;
        updated.resources.defaultTagIds = defaultTagIds;

        project = await project.update({ config: updated })

      }

    } catch(err) {
      console.log(err);
      process.exit();
    }

    await queryInterface.removeColumn( 'tags', 'extraFunctionality' );
  },

  async down ({ context: queryInterface }) {
    console.log('Sorry, status data down is not implemented');
  }
};
