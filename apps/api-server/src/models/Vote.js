var config = require('config');
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');

module.exports = function( db, sequelize, DataTypes ) {
	var Vote = sequelize.define('vote', {
		resourceId: {
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
			fields : ['resourceId', 'userId', 'deletedAt'],
			unique : true
		}],
		// paranoid: false,
	});

	Vote.associate = function( models ) {
		Vote.belongsTo(models.Resource, { onDelete: 'CASCADE' });
		Vote.belongsTo(models.User, { onDelete: 'CASCADE' });
	}

	Vote.scopes = function scopes() {
		return {

			forProjectId: function( projectId ) {
				return {
					// where: {
					//  	resourceId: [ sequelize.literal(`select id FROM resources WHERE projectId = ${projectId}`) ]
					// }
					include: [{
						model      : db.Resource,
						attributes : ['id', 'projectId'],
						required: true,
						where: {
							projectId: projectId
						}
					}],
				};
			},
			withResource: function() {
				return {
					include: [{
						model      : db.Resource,
						attributes : ['id', 'title', 'projectId', 'status', 'viewableByRole']
					}]
				}
			},
			includeUser: {
				include: [{
					model      : db.User,
					attributes : ['role', 'displayName', 'nickName', 'name', 'email', 'postcode']
				}]
			},
		}
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
