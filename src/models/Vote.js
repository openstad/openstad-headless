var config = require('config');
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');

module.exports = function( db, sequelize, DataTypes ) {
	var Vote = sequelize.define('vote', {
		ideaId: {
			type         : DataTypes.INTEGER,
			allowNull    : false
		},
		userId: {
			type         : DataTypes.INTEGER,
			allowNull    : false,
			defaultValue: 0,
		},
		confirmed: {
			type         : DataTypes.BOOLEAN,
			allowNull    : true,
			defaultValue : null
		},
		confirmReplacesVoteId: {
			type         : DataTypes.INTEGER,
			allowNull    : true,
			defaultValue : null
		},
		ip: {
			type         : DataTypes.STRING(64),
			allowNull    : true,
			validate     : {
				//isIP: true
			}
		},
		opinion: {
			type         : DataTypes.STRING(64),
			allowNull    : true,
			defaultValue : null
		},
		// This will be true if the vote validation CRON determined this
		// vote is valid.
		checked : {
			type         : DataTypes.BOOLEAN,
			allowNull    : true
		}
	}, {
		indexes: [{
			fields : ['ideaId', 'userId', 'deletedAt'],
			unique : true
		}],
		// paranoid: false,
	});

	Vote.associate = function( models ) {
		Vote.belongsTo(models.Idea);
		Vote.belongsTo(models.User);
	}

	Vote.scopes = function scopes() {
		return {

			forProjectId: function( projectId ) {
				return {
					// where: {
					//  	ideaId: [ sequelize.literal(`select id FROM ideas WHERE projectId = ${projectId}`) ]
					// }
					include: [{
						model      : db.Idea,
						attributes : ['id', 'projectId'],
						required: true,
						where: {
							projectId: projectId
						}
					}],
				};
			},
			withIdea: function() {
				return {
					include: [{
						model      : db.Idea,
						attributes : ['id', 'title', 'projectId', 'status', 'viewableByRole']
					}]
				}
			},
			includeUser: {
				include: [{
					model      : db.User,
					attributes : ['role', 'displayName', 'nickName', 'name', 'email', 'zipCode', 'postcode']
				}]
			},
		}
	}

	Vote.anonymizeOldVotes = function() {
		var anonymizeThreshold = config.get('ideas.anonymizeThreshold');
		return sequelize.query(`
					UPDATE
						votes v
					SET
						v.ip = NULL
					WHERE
						DATEDIFF(NOW(), v.updatedAt) > ${anonymizeThreshold} AND
						checked != 0
				`)
			.then(function([ result, metaData ]) {
				return metaData;
			});
	}

	Vote.prototype.toggle = function() {
		var checked = this.get('checked');
		return this.update({
			checked: checked === null ? false : !checked
		});
	}

  // TODO: dit wordt nauwelijks gebruikt omdat de logica helemaal in de route zit. Maar hier zou dus netter zijn.
	Vote.auth = Vote.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'member',
    updateableBy: ['moderator', 'owner'],
    deleteableBy: ['moderator', 'owner'],
    canToggle: function(user, self) {
      return userHasRole(user, 'moderator', self.userId);
    }
  }

	return Vote;
};
