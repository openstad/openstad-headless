var config = require('config');
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');

const updateResourceScore = async (vote, options) => {
  try {
    const run = async () => {
      const resource = await vote.getResource();
      if (resource && typeof resource.calculateAndSaveScore === 'function') {
        await resource.calculateAndSaveScore();
      }
    };

    // If create ran inside a transaction, wait for commit so other queries see the new row
    if (options && options.transaction && options.transaction.afterCommit) {
      options.transaction.afterCommit(() => {
        // fire-and-forget or await if you want to chain
        run().catch((err) =>
          console.error('Failed to recalc score after transaction commit:', err)
        );
      });
    } else {
      // no transaction: run immediately
      await run();
    }
  } catch (err) {
    console.error('Update resource score failed in hook for Vote:', err);
  }
}

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
    hooks: {
      afterCreate: async (vote, options) => {
        await updateResourceScore(vote, options);
      },

      afterUpdate: async function (vote, options) {
        await updateResourceScore(vote, options);
      },
      
      afterDestroy: async function (vote, options) {
        await updateResourceScore(vote, options);
      },
      
      afterUpsert: async function (vote, options) {
        await updateResourceScore(vote, options);
      }
      
    },
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
			includeResource: function() {
				return {
					include: [{
						model      : db.Resource,
						attributes : ['id', 'title', 'projectId', 'viewableByRole'],
            include: {
              model: db.Tag,
              attributes: ['id', 'type', 'name'],
              where: { type: 'status' },
              required: false,
            },
					}]
				}
			},
			includeUser: {
				include: [{
					model      : db.User,
					attributes : [
						'role',
						'displayName',
						'nickName',
						'name',
						'displayName',
						'email',
						'phonenumber',
						'address',
						'city',
						'postcode'
					]
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
    updateableBy: ['editor', 'owner'],
    deleteableBy: ['editor', 'owner'],
    canToggle: function(user, self) {
      return userHasRole(user, 'editor', self.userId);
    }
  }

	return Vote;
};
