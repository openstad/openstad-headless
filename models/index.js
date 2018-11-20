const knex = require('../knex/knex.js');
const bookshelf = require('bookshelf')(knex);

exports.Client = bookshelf.Model.extend({
  tableName: 'clients',
  hasTimestamps: true,
  hasTimestamps: ['createdAt', 'updatedAt']
});

exports.User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  hasTimestamps: ['createdAt', 'updatedAt']
});


exports.LoginToken = bookshelf.Model.extend({
  tableName: 'login_tokens',
  hasTimestamps: true,
  hasTimestamps: ['createdAt']
});
