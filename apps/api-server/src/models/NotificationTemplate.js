module.exports = ( db, sequelize, DataTypes ) => {
  const NotificationTemplate = sequelize.define('notification_template', {
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
    },
    templateFile: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    }
  }, {});

  NotificationTemplate.auth = NotificationTemplate.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin'
  };

  return NotificationTemplate;
};
