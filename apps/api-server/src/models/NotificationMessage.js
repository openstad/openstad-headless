const fs = require('fs').promises;
const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const sendMessage = require('../notifications/send-engines');

let nunjucksEnv;

(async () => {
  const { applyFilters } = await import('../../../../packages/raw-resource/includes/nunjucks-filters-js.cjs');

  nunjucksEnv = new nunjucks.Environment();
  applyFilters(nunjucksEnv);
})();

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
        if (options.data) {
          let template, templateData;
          try {
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

            templateData = options.data;
            templateData.project = await db.Project.scope('includeConfig', 'includeEmailConfig').findByPk(instance.projectId);
            let keys = ['resource', 'user', 'comment', 'submission'];
            for (let key of keys) {
              let idkey = key + 'Id';
              let model = key.charAt(0).toUpperCase() + key.slice(1);

              if (options.data[idkey]) {
                // Handle array of ids
                if (Array.isArray(options.data[idkey]) && options.data[idkey].length == 1) {
                  options.data[idkey] = options.data[idkey][0];
                }

                // If there are multiple IDs
                if (Array.isArray(options.data[idkey])) {
                  templateData[`${key}s`] = await db[model].findAll({ where: { id: options.data[idkey] } });
                } else {
                  // Special handling for 'Resource'
                  if (model === 'Resource') {
                    templateData[key] = await db.Resource.findByPk(options.data[idkey], {
                      include: [{ model: db.Tag, attributes: ['name', 'type'] }]
                    });
                  } else {
                    // Default behavior for other models
                    templateData[key] = await db[model].findByPk(options.data[idkey]);
                  }
                }
              }
            }
          } catch (err) {
            throw err;
          }

          try {
            instance.subject = nunjucksEnv.renderString(template.subject, { ...templateData });
            let body = nunjucksEnv.renderString(template.body, { ...templateData });
            body = mjml2html(body);
            instance.body = body.html;
          } catch (err) {
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

  NotificationMessage.prototype.send = async function () {
    try {
      await sendMessage[this.engine]({ message: this });
      await this.update({ status: 'sent' });
    } catch (err) {
      console.error('Send failed:', err);
      throw err;
    }
  }

  return NotificationMessage;

};
