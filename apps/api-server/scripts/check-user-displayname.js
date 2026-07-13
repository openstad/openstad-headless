// Standalone self-check for the User.displayName fallback: projectDisplayName || nickName || name.
// Run with (from apps/api-server): node scripts/check-user-displayname.js
// Lives in scripts/ — NOT src/models/ — so the model loader (util.invokeDir) does not require it on boot.
// The api-server has no jest config on this branch, so this is a plain-node assert script.
// build() computes virtual fields from dataValues without needing a DB connection.
const assert = require('assert');
const { Sequelize, DataTypes } = require('sequelize');

function buildUser(values) {
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });
  const User = require('../src/models/User.js')({}, sequelize, DataTypes);
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
