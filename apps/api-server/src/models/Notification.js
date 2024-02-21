const merge = require('merge');

module.exports = ( db, sequelize, DataTypes ) => {
  const Notification = sequelize.define('notification', {

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    engine: {
      type: DataTypes.ENUM('email', 'sms', 'carrier pigeon'),
      allowNull: false,
      default: 'email',
    },

    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'new',
    },

    from: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    to: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },

  }, {

    hooks: {

      beforeValidate: async function (instance, options) {

        // set defaults - todo: opschonen en netter uitschrijven, maar eerst eens kijken of dit voldoet
        let engine = instance.engine || 'email';
        if (instance.type == 'login sms') {
          engine = instance.engine || 'sms';
        }
        if (instance.type == 'message by carrier pigeon') {
          engine = instance.engine || 'carrier pigeon';
        }
        instance.engine = engine;

        // from
        let project;
        if (instance.projectId || !instance.from) {
          project = await db.Project.scope('includeEmailConfig').findByPk(instance.projectId);
          instance.from = project.emailConfig?.notifications?.fromAddress;
        }

        // to
        let user;
        if (!instance.to) {
          let managerTypes = ['new published resource - admin update', 'updated resource - admin update', 'project issues warning', 'new or updated comment - admin update', 'submission', 'action', 'message by carrier pigeon'];
          if (managerTypes.find(type => type == instance.type)) {
            instance.to = project.emailConfig?.notifications?.projectmanagerAddress;
          }
          let adminTypes = ['system issues warning'];
          if (adminTypes.find(type => type == instance.type)) {
            instance.to = project.emailConfig?.notifications?.projectadminAddress;
          }
          if (!instance.to && instance.data?.userId){
            user = await db.User.findByPk(instance.data?.userId);
            instance.to = user?.email;
            if (instance.engine == 'sms') {
              instance.to = user?.phoneNumber;
            }
          }
        }

      },

      afterCreate: async function (instance, options) {
        try {

          await instance.update({ status: 'pending' });
          
          // send immediatly or wait for cron
          let immediateTypes = ['new concept resource - user feedback', 'new published resource - user feedback', 'updated resource - user feedback', 'new published resource - admin update', 'updated resource - admin update', 'login email', 'login sms', 'user account about to expire', 'project issues warning', 'system issues warning', 'action', 'message by carrier pigeon'];
          if (immediateTypes.find(type => type == instance.type)) {
            let message = await db.NotificationMessage.create({
              projectId: instance.projectId,
              engine: instance.engine,
              type: instance.type,
              from: instance.from,
              to: instance.to,
            }, {
              data: {
                ...instance.data
              }
            });
            await message.send();
            await instance.update({ status: 'sent' });
          } else {
            await instance.update({ status: 'queued' });
          }

        } catch(err) {
          console.log('Error: Send NotificationMessage failed - id =', instance.id);
          throw err;
        }
      }

    },

  });

  Notification.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  }

  Notification.auth = Notification.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return Notification;

};
