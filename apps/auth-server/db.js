'use strict';

const { Sequelize } = require('sequelize');
const getDbPassword = require('./utils/getDbPassword')

const ssl = {
  rejectUnauthorized: false
}

if (process.env.MYSQL_CA_CERT) {
  ssl.ca = process.env.MYSQL_CA_CERT;
  ssl.rejectUnauthorized = true;
}

if (process.env.DB_REQUIRE_SSL) {
  ssl.require = true;
  ssl.rejectUnauthorized = true;
}

const dialectOptions = {
  ssl
};

let sequelize = new Sequelize({
  hooks: {
    beforeConnect: async (config) => config.password = await getDbPassword()
  },
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  port:     process.env.DB_PORT || '3306',

  dialect: process.env.DB_DIALECT || 'mysql',
  dialectOptions,

  dialectModule: require('mysql2'),

  logging: null,
  // logging: console.log,

  pool: {
    max: parseInt(process.env.DB_MAX_POOL_SIZE || process.env.maxPoolSize) || 5,
  },

});

let db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// add models
db.AccessToken = require('./model/access-token')(db, sequelize, Sequelize);
db.ActionLog = require('./model/action-log')(db, sequelize, Sequelize);
db.Client = require('./model/client')(db, sequelize, Sequelize);
db.ExternalCsrfToken = require('./model/external-csrf-token')(db, sequelize, Sequelize);
db.LoginToken = require('./model/login-token')(db, sequelize, Sequelize);
db.PasswordResetToken = require('./model/password-reset-token')(db, sequelize, Sequelize);
db.Role = require('./model/role')(db, sequelize, Sequelize);
db.UniqueCode = require('./model/unique~code')(db, sequelize, Sequelize);
db.User = require('./model/user')(db, sequelize, Sequelize);
db.UserRole = require('./model/user-role')(db, sequelize, Sequelize);

// invoke associations and scopes
for (let modelName in sequelize.models) {
  let model = sequelize.models[modelName];
  if (model.associate) model.associate();
  let scopes = model.scopes && model.scopes() || {};
  for (let scopeName in scopes) {
		model.addScope(scopeName, scopes[scopeName], {override: true});
  }
  model.prototype.toJSON = function(params) {
    let result = {};
    for (let key in this.dataValues) {
      let target = this[key];
      if (target && target.toJSON) {
        result[key] = target.toJSON(params);
      } else {
        result[key] = target;
      }
    }
    return result;
  }
}

module.exports = db;
