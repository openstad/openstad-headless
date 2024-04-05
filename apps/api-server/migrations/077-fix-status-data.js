const { Sequelize } = require('sequelize');
const db = require('../src/db');

module.exports = {
  async up ({ context: queryInterface }) {

    try {

      let projects = await db.Project.findAll();
      for (let project of projects) {

        let defaultStatusId = project.config.statuses?.defaultStatusId || project.config.statusses?.defaultStatusId;
        // rename
        let updated = { resources: {} }
        if (project.config.statusses) updated.statusses = null;
        if (project.config.statuses) updated.statuses = null;

        let statuses = await db.Tag.findAll({
          where: {
            type: 'status',
            projectId: project.id,
          },
        });
        if (statuses.length) {
          // check defaultStatus
          if (!statuses.find(s => s.id == defaultStatusId)) {
            defaultStatusId = statuses[0].id
            console.log(`Let op: default status voor project ${project.name} is gezet op ${statuses[0].name} (${statuses[0].id})`);
          }
          // move to status table
          for (let status of statuses) {
            let newstatus = await db.Status.create({
              ...status.dataValues
            });
            await status.destroy();
          }
        }

        statuses = await db.Status.findAll({
          where: {
            projectId: project.id,
          },
        });
        if (statuses.length) {
          // check defaultStatus
          if (!statuses.find(s => s.id == defaultStatusId)) {
            defaultStatusId = statuses[0].id
            console.log(`Let op: default status voor project ${project.name} is gezet op ${statuses[0].name} (${statuses[0].id})`);
          }
        } else {
          // create at least one
          let status = await db.Status.create({
            projectId: project.id,
            name: 'open',
            seqnr: 10,
            extraFunctionality: {
              editableByUser: true
            },
          });
          statuses = [status];
          defaultStatusId = status.id;
        }
        if (!defaultStatusId) {
          defaultStatusId = statuses[0].id;
          console.log(`Let op: default status voor project ${project.name} is gezet op ${statuses[0].name} (${statuses[0].id})`);
        }
        updated.resources.defaultStatusIds = [ defaultStatusId ];
        project = await project.update({ config: updated })
        let defaultStatus = await db.Status.findOne({
          where: {
            id: defaultStatusId,
          },
        });
        let resources = await db.Resource.scope('includeStatuses').findAll({ where: { projectId: project.id } });
        for (let resource of resources) {
          if (!resource.statuses.length) {
            resource.setStatuses(defaultStatus)
          }
        }
      }

    } catch(err) {
      console.log(err);
      process.exit();
    }

  },

  async down ({ context: queryInterface }) {
    console.log('Sorry, status data down is not implemented');
  }
};


