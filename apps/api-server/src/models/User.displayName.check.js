// Standalone self-check for the User.displayName fallback: projectDisplayName || nickName || name.
// Run with: node src/models/User.displayName.check.js
// The api-server has no jest config on this branch, so this is a plain-node assert script.
// build() computes virtual fields from dataValues without needing a DB connection.
const assert = require('assert');
const { Sequelize, DataTypes } = require('sequelize');

function buildUser(values) {
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });
  const User = require('./User.js')({}, sequelize, DataTypes);
  return User.build(values);
}

assert.strictEqual(
  buildUser({ name: 'Freek', nickName: 'Freeky', projectDisplayName: 'Administrator' })
    .displayName,
  'Administrator',
  'projectDisplayName moet voorrang hebben'
);
assert.strictEqual(
  buildUser({ name: 'Freek', nickName: 'Freeky' }).displayName,
  'Freeky',
  'valt terug op nickName'
);
assert.strictEqual(
  buildUser({ name: 'Freek' }).displayName,
  'Freek',
  'valt terug op name'
);

console.log('OK: User.displayName fallback (projectDisplayName || nickName || name)');
