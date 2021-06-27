const knex = require('../knex/knex.js');
const bookshelf = require('bookshelf')(knex);
const jsonColumns = require('bookshelf-json-columns');
const sanitize = require('../utils/sanitize')
const configAuthTypes = require('../config/auth.js').types;
bookshelf.plugin(jsonColumns);

const Client = bookshelf.Model.extend({
  tableName: 'clients',
  hasTimestamps: ['createdAt', 'updatedAt'],
  jsonColumns: ['authTypes', 'requiredFields'],
  getAuthTypes: (model) => {
    const authTypes = JSON.parse(model.get('authTypes'));

    return authTypes.map((authType) => {
      let configAuthType = configAuthTypes.find(type => type.key === authType);
      return configAuthType;
    });
  }
});

const LoginToken = bookshelf.Model.extend({
  tableName: 'login_tokens',
  hasTimestamps: ['createdAt', 'updatedAt']
});

const UniqueCode = bookshelf.Model.extend({
  tableName: 'unique_codes',
  hasTimestamps: ['createdAt', 'updatedAt']
});

const Role = bookshelf.Model.extend({
  tableName: 'roles',
  hasTimestamps: ['createdAt', 'updatedAt']
});

const UserRole = bookshelf.Model.extend({
  tableName: 'user_roles',
  hasTimestamps: ['createdAt', 'updatedAt']
});

const PasswordResetToken = bookshelf.Model.extend({
  tableName: 'password_reset_tokens',
  hasTimestamps: ['createdAt', 'updatedAt']
});

const userKeysToSanitize = ['firstName', 'lastName', 'email', 'phoneNumber', 'extraData', 'streetName', 'houseNumber', 'city', 'suffix', 'postcode', 'password', 'resetPasswordToken']

const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],
  roles() {
    return this.belongsToMany(Role, 'user_roles', 'userId', 'roleId');
  },
  format(attributes) {
    userKeysToSanitize.forEach((key) => {
      if (attributes[key]) {
        attributes[key] = sanitize.noTags(attributes[key]);
      }
    });

    return attributes;
  }
});

const ActionLog = bookshelf.Model.extend({
  tableName: 'action_log',
  hasTimestamps: ['createdAt', 'updatedAt']
});

const ExternalCsrfToken = bookshelf.Model.extend({
  tableName: 'external_csrf_tokens',
  hasTimestamps: ['createdAt', 'updatedAt']
});

exports.Client = Client;
exports.User = User;
exports.LoginToken = LoginToken;
exports.UniqueCode = UniqueCode;
exports.Role = Role;
exports.UserRole = UserRole;
exports.PasswordResetToken = PasswordResetToken;
exports.ActionLog = ActionLog;
exports.ExternalCsrfToken = ExternalCsrfToken;
