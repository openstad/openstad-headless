const fs = require('fs').promises;
const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const sendMessage = require('../notifications/send-engines');

module.exports = ( db, sequelize, DataTypes ) => {
  const NotificationMessage = sequelize.define('notification_message', {

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
      unique: false,
      defaultValue: 'new',
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },

    from: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },

    to: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },

    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
    },

  }, {

    hooks: {

      beforeValidate: async function (instance, options) {
        if (options.data) { // create subject and body

          let template, templateData;
          try {
            
            // template
            template = await db.NotificationTemplate.findOne({
              where: {
                projectId: instance.projectId,
                type: instance.type,
              }
            });
            if (!template) {
              let file = await fs.readFile(`src/notifications/default-templates/${instance.type}`);
              file = file.toString();
              let match = file.match(/<subject>((?:.|\r|\n)*)<\/subject>(?:.|\r|\n)*<body>((?:.|\r|\n)*)<\/body>/)
              let subject = match && match[1];
              let body = match && match[2];
              if (subject && body) template = { subject, body };
            }
            if (!template) throw new Error('Notification template not found');

            // fetch data
            templateData = {};
            templateData.project = await db.Project.scope('includeConfig', 'includeEmailConfig').findByPk(instance.projectId);
            let keys = ['resource', 'user', 'comment', 'submission'];
            for (let key of keys) {
              let idkey = key + 'Id';
              let model = key.charAt(0).toUpperCase() + key.slice(1);
              if (options.data[idkey]) {
                if (Array.isArray(options.data[idkey]) && options.data[idkey].length == 1) options.data[idkey] = options.data[idkey][0];
                if (Array.isArray(options.data[idkey])) {
                  templateData[`${key}s`] = await db[model].findAll({where: { id: options.data[idkey] }});
                } else {
                  templateData[key] = await db[model].findByPk( options.data[idkey] );
                }
              }
            }

          } catch(err) {
            throw err;
          }

          try {

            // parse template
            instance.subject = nunjucks.renderString(template.subject, {...templateData});

            let body = nunjucks.renderString(template.body, {...templateData});
            body = mjml2html(body);
            instance.body = body.html;

          } catch(err) {
            // do not crash on a render error
            console.log(err);
          }
          
        }
      }

    }

  });

  NotificationMessage.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  }

  NotificationMessage.auth = NotificationMessage.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  NotificationMessage.prototype.send = async function() {
    try {
      let engine = this.engine;
      await sendMessage[engine]({ message: this });
      await this.update({ status: 'sent' });
    } catch(err) {
      console.log('Send failed');
      throw err;
    }
  }

  return NotificationMessage;

};
