const { Sequelize } = require('sequelize');
const db = require('../src/db');

module.exports = {
  async up ({ context: queryInterface }) {

    try {

      let projects = await db.Project.findAll();
      for (let project of projects) {

        let defaultStatusIds = project.config?.resources?.defaultStatusIds || [];
        let statuses = await db.Status.findAll({ where: { id: defaultStatusIds } });

        for (let status of statuses) {
          await status.update({ addToNewResources: true });
        }

        let defaultTagIds = project.config?.resources?.defaultTagIds || [];
        let tags = await db.Tag.findAll({ where: { id: defaultTagIds } });

        for (let tag of tags) {
          await tag.update({ addToNewResources: true });
        }

        project.update({ config: { resources: { defaultStatusIds: null, defaultTagIds: null } } });

      }

    } catch(err) {
      console.log(err);
      process.exit();
    }

  },

  async down ({ context: queryInterface }) {
    console.log('Sorry, default tags and status down is not implemented');
  }

};


