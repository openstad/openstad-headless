var Sequelize = require('sequelize');
var _         = require('lodash');
var util      = require('./util');

var config    = require('config');
var dbConfig  = config.get('database');

// newer versions of mysql (8+) have changed GeomFromText to ST_GeomFromText
// this is a fix for sequalize
if (dbConfig.mysqlSTGeoMode == 'on') {
	const wkx = require('wkx')
	Sequelize.GEOMETRY.prototype._stringify = function _stringify(value, options) {
	  return `ST_GeomFromText(${options.escape(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
	}
	Sequelize.GEOMETRY.prototype._bindParam = function _bindParam(value, options) {
	  return `ST_GeomFromText(${options.bindParam(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
	}
	Sequelize.GEOGRAPHY.prototype._stringify = function _stringify(value, options) {
	  return `ST_GeomFromText(${options.escape(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
	}
	Sequelize.GEOGRAPHY.prototype._bindParam = function _bindParam(value, options) {
	  return `ST_GeomFromText(${options.bindParam(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
	}
}

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

console.log(dbConfig);

var sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
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
