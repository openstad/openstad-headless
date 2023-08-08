const config = require('config');
const eventService = require('../services/eventService');
const getSequelizeConditionsForFilters = require('./../util/getSequelizeConditionsForFilters');


module.exports = function (db, sequelize, DataTypes) {
  const Submission = sequelize.define('submission', {

    projectId: {
      type: DataTypes.INTEGER,
      defaultValue: config.projectId && typeof config.projectId == 'number' ? config.projectId : 0,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    formName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('approved', 'pending', 'unapproved'),
      defaultValue: 'pending',
      allowNull: false
    },
		formId: {
			type         : DataTypes.TEXT,
			allowNull    : true
		},
    submittedData: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: {},
      get: function () {
        // for some reason this is not always done automatically
        let value = this.getDataValue('submittedData');
        try {
          if (typeof value == 'string') {
            value = JSON.parse(value);
          }
        } catch (err) {
        }
        return value;
      },
      set: function (value) {
        try {
          if (typeof value == 'string') {
            value = JSON.parse(value);
          }
        } catch (err) {
        }
        this.setDataValue('submittedData', JSON.stringify(value));
      }
    },

  }, { hooks: {
    afterCreate: (instance, options) => {
      const ruleSetData = {
        resource: 'submission',
        eventType: 'CREATE',
        instance
      }
      try {
        eventService.publish(db.NotificationRuleSet, parseInt(instance.projectId), ruleSetData);
      } catch (error) {
        console.error(error);
      }
    }
  }
  });

	Submission.scopes = function scopes() {
		return {
			defaultScope: {},
			withUser: {
				include: [{
					model      : db.User,
					attributes : ['role', 'displayName', 'nickName', 'name', 'email']
				}]
			},
            forProjectId: function (projectId) {
                return {
                    where: {
                        projectId: projectId,
                    }
                };
            },
            filter:    function (filtersInclude, filtersExclude) {
                const filterKeys = [
                    {
                        'key': 'id'
                    },
                    {
                        'key': 'status'
                    },
                    {
                        'key': 'formId'
                    },
                ];

                return getSequelizeConditionsForFilters(filterKeys, filtersInclude, sequelize, filtersExclude);
            },
		};
	}

  Submission.auth = Submission.prototype.auth = {
    listableBy: 'admin',
    viewableBy: ['admin', 'owner'],
    createableBy: 'all',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  }

  return Submission;
};
