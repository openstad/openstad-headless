module.exports = ( db, sequelize, DataTypes ) => {
  const NotificationTemplate = sequelize.define('notification_template', {

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

    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true,
      default: '',
    },

    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      default: '',
    },

  }, {});

  NotificationTemplate.auth = NotificationTemplate.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin'
  };

  NotificationTemplate.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  }

  return NotificationTemplate;

};

