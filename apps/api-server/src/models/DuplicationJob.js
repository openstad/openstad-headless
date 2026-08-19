module.exports = function (db, sequelize, DataTypes) {
  let DuplicationJob = sequelize.define(
    'duplicationJob',
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      sourceProjectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },

      payload: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },

      result: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      claimedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        default: null,
      },
    },
    {
      paranoid: true,
      tableName: 'duplicationJobs',
    }
  );

  DuplicationJob.auth = DuplicationJob.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return DuplicationJob;
};
