const config = require('config');

module.exports = function (db, sequelize, DataTypes) {
  const Submission = sequelize.define('submission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
  });

  Submission.scopes = function scopes() {
    return {
      defaultScope: {},
      includeUser: {
        include: [
          {
            model: db.User,
            attributes: [
              'role',
              'displayName',
              'nickName',
              'name',
              'displayName',
              'email',
              'phonenumber',
              'address',
              'city',
              'postcode',
            ],
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
    listableBy: 'editor',
    viewableBy: ['editor', 'owner'],
    createableBy: 'all',
    updateableBy: 'editor',
    deleteableBy: 'editor',
  };

  Submission.associate = function (models) {
    this.belongsTo(models.Widget);
    Submission.belongsTo(models.User, { onDelete: 'CASCADE' });
  };

  return Submission;
};
