const knex = require('../knex/knex.js');
const bookshelf = require('bookshelf')(knex);
const jsonColumns = require('bookshelf-json-columns');
const configAuthTypes = require('../config/auth.js').types;
bookshelf.plugin(jsonColumns);

exports.Client = bookshelf.Model.extend({

  tableName: 'clients',
  hasTimestamps: true,
  hasTimestamps: ['createdAt', 'updatedAt'],
  jsonColumns: ['authTypes', 'requiredFields'],
  getAuthTypes: (model) => {
    const authTypes = JSON.parse(model.get('authTypes'));

    return authTypes.map((authType) => {
      let configAuthType = configAuthTypes.find(type => type.key === authType);
      return  configAuthType;
    });
  }
});

exports.User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  hasTimestamps: ['createdAt', 'updatedAt']
});

exports.LoginToken = bookshelf.Model.extend({
  tableName: 'login_tokens',
  hasTimestamps: true,
  hasTimestamps: ['createdAt',  'updatedAt']
});

exports.UniqueCode = bookshelf.Model.extend({
  tableName: 'unique_codes',
  hasTimestamps: true,
  hasTimestamps: ['createdAt',  'updatedAt']
});

exports.Role = bookshelf.Model.extend({
  tableName: 'role',
  hasTimestamps: true,
  hasTimestamps: ['createdAt',  'updatedAt']
});

exports.PasswordResetToken  = bookshelf.Model.extend({
  tableName: 'password_reset_tokens',
  hasTimestamps: true,
  hasTimestamps: ['createdAt',  'updatedAt']
});
