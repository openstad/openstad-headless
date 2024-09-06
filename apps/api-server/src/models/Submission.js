const config = require('config');

module.exports = function (db, sequelize, DataTypes) {
  const Submission = sequelize.define(
    'submission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      projectId: {
        type: DataTypes.INTEGER,
        defaultValue:
          config.projectId && typeof config.projectId == 'number'
            ? config.projectId
            : 0,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('approved', 'pending', 'unapproved'),
        defaultValue: 'pending',
        allowNull: false,
      },
      submittedData: {
        type: DataTypes.JSON,
        default: {},
        allowNull: false,
      },
    }
  );

  Submission.scopes = function scopes() {
    return {
      defaultScope: {},
      includeUser: {
        include: [
          {
            model: db.User,
            attributes: ['role', 'displayName', 'nickName', 'name', 'email'],
          },
        ],
      },
      forProjectId: function (projectId) {
        return {
          where: {
            projectId: projectId,
          },
        };
      },
    };
  };

  Submission.auth = Submission.prototype.auth = {
    listableBy: 'admin',
    viewableBy: ['admin', 'owner'],
    createableBy: 'all',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  Submission.associate = function (models) {
    this.belongsTo(models.Widget);
  };

  return Submission;
};
