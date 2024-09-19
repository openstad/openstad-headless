module.exports = function( db, sequelize, DataTypes ) {
  let ChoicesGuideResult = sequelize.define('choices_guide_result', {

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    widgetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    result: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get: function() {
        let value = this.getDataValue('result');
        try {
          if (typeof value == 'string') {
            value = JSON.parse(value);
          }
        } catch (err) {}
        return value;
      },
      set: function(value) {

        try {
          if (typeof value == 'string') {
            value = JSON.parse(value);
          }
        } catch (err) {}

        let oldValue = this.getDataValue('result');
        try {
          if (typeof oldValue == 'string') {
            oldValue = JSON.parse(oldValue) || {};
          }
        } catch (err) {}

        oldValue = oldValue || {};
        Object.keys(oldValue).forEach((key) => {
          if (!value[key]) {
            value[key] = oldValue[key];
          }
        });

        this.setDataValue('result', JSON.stringify(value));

      }
    },

  });

  ChoicesGuideResult.scopes = function scopes() {

    return {
      defaultScope: {},

      forProjectId: function (projectId) {
        return {
          where: {
            projectId: projectId,
          },
        };
      },
      includeUser: {
        include: [
          {
            model: db.User,
            attributes: ['role', 'displayName', 'nickName', 'name', 'email'],
          },
        ],
      },

    };
  };

  ChoicesGuideResult.associate = function( models ) {
    this.belongsTo(models.Widget);
    this.belongsTo(models.User, { onDelete: 'CASCADE' });
  };

  // dit is hoe het momenteel werkt; ik denk niet dat dat de bedoeling is, maar ik volg nu
	ChoicesGuideResult.auth = ChoicesGuideResult.prototype.auth = {
    listableBy: 'editor',
    viewableBy: 'all',
    createableBy: 'all',
    updateableBy: ['editor', 'owner'],
    deleteableBy: 'admin',
  }

  return ChoicesGuideResult;

};
