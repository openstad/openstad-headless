// db is a default param so tests can inject a stub without loading the real db
module.exports = async function processQueuedNotifications(
  db = require('../db')
) {
  try {
    let queuedNotifications = await db.Notification.scope().findAll({
      where: { status: 'queued' },
    });

    // aggregate per project, type, from, to
    let targets = {};
    queuedNotifications.forEach((notification) => {
      let projectId = notification.projectId;
      if (!targets[projectId]) targets[projectId] = {};
      let type = notification.type;
      if (!targets[projectId][type]) targets[projectId][type] = {};
      let from = notification.from;
      if (!targets[projectId][type][from]) targets[projectId][type][from] = {};
      let to = notification.to;
      if (!targets[projectId][type][from][to])
        targets[projectId][type][from][to] = [];
      targets[projectId][type][from][to].push(notification);
    });

    // foreach target
    let projectIds = Object.keys(targets);
    for (let projectId of projectIds) {
      let types = Object.keys(targets[projectId]);
      for (let type of types) {
        let froms = Object.keys(targets[projectId][type]);
        for (let from of froms) {
          let tos = Object.keys(targets[projectId][type][from]);
          for (let to of tos) {
            // target is now an array of notifications
            let target = targets[projectId][type][from][to];
            try {
              // merge data
              let data = {};
              target.forEach((entry) => {
                Object.keys(entry.data).map((key) => {
                  if (!data[key]) data[key] = [];
                  if (!data[key].find((d) => d == entry.data[key]))
                    data[key].push(entry.data[key]);
                });
              });

              let instance = target[0]; // ignore other multiple fields like subject

              let message = await db.NotificationMessage.create(
                {
                  projectId: instance.projectId,
                  engine: instance.engine,
                  type: instance.type,
                  from: instance.from,
                  to: instance.to,
                },
                {
                  data,
                }
              );
              await message.send();
              for (let entry of target) {
                await entry.update({ status: 'sent' });
              }
            } catch (err) {
              // one broken notification must not stop the rest of the queue
              console.log(
                `Error: sending queued notification of type '${type}' for project ${projectId} failed, marking as failed`
              );
              console.log(err);
              for (let entry of target) {
                await entry.update({ status: 'failed' });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log('Error: Send queued NotificationMessages failed');
    console.log(err);
  }
};
