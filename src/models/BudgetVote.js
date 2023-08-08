const config = require('config');

module.exports = function( db, sequelize, DataTypes ) {

	var BudgetVote = sequelize.define('budgetVote', {

		projectId: {
			type         : DataTypes.INTEGER,
			defaultValue : config.projectId && typeof config.projectId == 'number' ? config.projectId : 0,
		},

		userId: {
			type         : DataTypes.STRING,
			defaultValue : null,
			allowNull    : 0,
		},

		userIp: {
			type         : DataTypes.STRING(64),
			allowNull    : true,
			validate     : {
				isIP: true
			}
		},

		vote: {
			type         : DataTypes.STRING,
			defaultValue : '[]',
			allowNull    : false,
		},

	});

	BudgetVote.associate = function( models ) {
		// BudgetVote.hasMany(models.Idea);
	}

	BudgetVote.scopes = function() {

		let scopes = {};

		if (config.projectId && typeof config.projectId == 'number') {
			scopes.projectScope = {
				where: {
					projectId: config.projectId,
				}
			}
		}
		
		return scopes;
	}

  // volgens mij wordt dit niet meer gebruikt
	BudgetVote.auth = BudgetVote.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  }
  
	return BudgetVote;

};
