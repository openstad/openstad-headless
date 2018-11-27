const knex = require('../knex/knex.js');
const bookshelf = require('bookshelf')(knex);
const jsonColumns = require('bookshelf-json-columns');
bookshelf.plugin(jsonColumns);


exports.Client = bookshelf.Model.extend({
  tableName: 'clients',
  hasTimestamps: true,
  hasTimestamps: ['createdAt', 'updatedAt'],
  jsonColumns: ['authTypes', 'requiredFields'],
  getAuthTypes: () => {
    const authTypes = this.get('authTypes');
    console.log('=====<><><><> authTypes', authTypes);

    return authTypes.map((authType) => {
      let configAuthType = configAuthTypes.find(type => type.key === authType.key);
      return Object.assign(authType, configAuthType);
    })
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
