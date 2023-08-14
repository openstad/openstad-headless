var sanitize = require('../util/sanitize');
var config = require('config')

module.exports = function( db, sequelize, DataTypes ) {

	var IdeaTag = sequelize.define('idea-tag', {
	}, {
    paranoid: false
	});

	IdeaTag.scopes = function scopes() {
		return {
			defaultScope: {
			},

      forProjectId: function( projectId ) {
        return {
          where: {
            projectId: projectId,
          }
        };
      },

      includeProject: {
        include: [{
          model: db.Project,
        }]
      },

		}
	}

  // dit is hoe het momenteel werkt; ik denk niet dat dat de bedoeling is, maar ik volg nu
	IdeaTag.auth = IdeaTag.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'editor',
    updateableBy: 'editor',
    deleteableBy: 'editor',
  }

	return IdeaTag;

}
