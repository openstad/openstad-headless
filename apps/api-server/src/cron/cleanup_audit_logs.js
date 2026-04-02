const BATCH_SIZE = 10000;

function createOnTick(database) {
  return async function () {
    if (!database) {
      database = require('../db');
    }

    try {
      const retentionMonths =
        parseInt(process.env.AUDIT_RETENTION_MONTHS) || 12;
      const incidentRetentionMonths =
        parseInt(process.env.AUDIT_INCIDENT_RETENTION_MONTHS) || 36;

      const projectsWithIncident = await database.Project.findAll({
        where: {
          auditIncidentAt: { [database.Sequelize.Op.ne]: null },
        },
        attributes: ['id', 'auditIncidentAt'],
        raw: true,
      });

      const incidentProjectIds = new Set();
      const incidentCutoff = new Date();
      incidentCutoff.setMonth(
        incidentCutoff.getMonth() - incidentRetentionMonths
      );

      for (const project of projectsWithIncident) {
        if (new Date(project.auditIncidentAt) > incidentCutoff) {
          incidentProjectIds.add(project.id);
        }
      }

      const defaultCutoff = new Date();
      defaultCutoff.setMonth(defaultCutoff.getMonth() - retentionMonths);

      const extendedCutoff = new Date();
      extendedCutoff.setMonth(
        extendedCutoff.getMonth() - incidentRetentionMonths
      );

      let totalDeleted = 0;

      let deleted;
      do {
        const where = {
          createdAt: { [database.Sequelize.Op.lt]: defaultCutoff },
        };

        if (incidentProjectIds.size > 0) {
          where[database.Sequelize.Op.or] = [
            {
              projectId: {
                [database.Sequelize.Op.notIn]: [...incidentProjectIds],
              },
            },
            { projectId: null },
          ];
        }

        deleted = await database.AuditLog.destroy({
          where,
          limit: BATCH_SIZE,
        });
        totalDeleted += deleted;
      } while (deleted === BATCH_SIZE);

      if (incidentProjectIds.size > 0) {
        do {
          deleted = await database.AuditLog.destroy({
            where: {
              projectId: {
                [database.Sequelize.Op.in]: [...incidentProjectIds],
              },
              createdAt: { [database.Sequelize.Op.lt]: extendedCutoff },
            },
            limit: BATCH_SIZE,
          });
          totalDeleted += deleted;
        } while (deleted === BATCH_SIZE);
      }

      if (totalDeleted > 0) {
        console.log(
          `[cron] cleanup_audit_logs: deleted ${totalDeleted} audit log records`
        );
      }
    } catch (err) {
      console.error('[cron] cleanup_audit_logs error:', err);
    }
  };
}

module.exports = {
  cronTime: '0 30 2 * * *',
  onTick: createOnTick(),
  onComplete: function () {},
  // Exposed for testing
  createOnTick,
};
