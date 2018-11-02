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
  hasTimestamps: ['created_at', 'updated_at']
});


exports.Users = bookshelf.Collection.extend({
  model: User
});
