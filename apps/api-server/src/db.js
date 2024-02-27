'use strict';

const Sequelize = require('sequelize');
const _         = require('lodash');
const util      = require('./util');

const config    = require('config');
const dbConfig  = config.get('database');

const dialectOptions = {
	charset            : 'utf8',
	multipleStatements : dbConfig.multipleStatements,
	socketPath         : dbConfig.socketPath
}

if (dbConfig.MYSQL_CA_CERT && dbConfig.MYSQL_CA_CERT.trim && dbConfig.MYSQL_CA_CERT.trim()) {
	dialectOptions.ssl = {
		rejectUnauthorized: true,
		ca: [ dbConfig.MYSQL_CA_CERT ]
	}
}

let sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
	dialect        : dbConfig.dialect,
	host           : dbConfig.host,
	port					 : dbConfig.port || 3306,
	dialectOptions,
	timeZone       : config.timeZone,
	logging        : require('debug')('app:db:query'),
 	//logging				 : console.log,
	typeValidation : true,

	define: {
		charset        : 'utf8',
		underscored    : false, // preserve columName casing.
		underscoredAll : true, // tableName to table_name.
		paranoid       : true // deletedAt column instead of removing data.
	},
	pool: {
		min  : 0,
		max  : dbConfig.maxPoolSize,
		idle : 10000
	},
});

// fix a bug in findAndCountAll: https://github.com/sequelize/sequelize/issues/10557
sequelize.addHook('beforeCount', function (options) {
  if (this._scope.include && this._scope.include.length > 0) {
    options.distinct = true
    options.col = this._scope.col || options.col || `${this.options.name.singular}.id`
  }
  if (options.include && options.include.length > 0) {
    options.include = null
  }
})

// Define models.
let db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
let models = require('./models')(db, sequelize, Sequelize.DataTypes);

// authentication mixins
const mixins = require('./lib/sequelize-authorization/mixins');
Object.keys(models).forEach((key) => {
  let model = models[key];
  model.can = model.prototype.can = mixins.can;
  model.prototype.toJSON = mixins.toAuthorizedJSON;
  model.authorizeData = model.prototype.authorizeData = mixins.authorizeData;
});

_.extend(db, models);

// Invoke associations on each of the models.
_.forEach(models, function( model ) {
	if( model.associate ) {
		model.associate(models);
	}
	if( model.scopes ) {
		_.forEach(model.scopes(), function( scope, name ) {
			model.addScope(name, scope, {override: true});
		});
	}
});

module.exports = db;
