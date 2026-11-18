const { Validator } = require('sequelize');

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const BRANDING_KEYS = ['logo', 'favicon', 'accentColor'];

const EMAIL_SECTIONS = {
  login: ['fromAddress', 'fromName', 'helpAddress'],
  notifications: ['fromAddress', 'fromName', 'replyTo'],
};

const ADDRESS_LABELS = {
  'login.fromAddress': 'het afzenderadres van de inlogmails',
  'login.helpAddress': 'het e-mailadres voor hulpvragen',
  'notifications.fromAddress': 'het afzenderadres van de notificaties',
  'notifications.replyTo': 'het reply-to adres',
};

const REQUIRED_ADDRESSES = ['login.fromAddress', 'notifications.fromAddress'];

function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function assertKnownStrings(value, keys, name) {
  for (const [key, fieldValue] of Object.entries(value)) {
    if (!keys.includes(key)) {
      throw new Error(`${name} contains an unknown field: ${key}`);
    }
    if (typeof fieldValue !== 'string') {
      throw new Error(`${name}.${key} must be a string`);
    }
  }
}

function addressAt(email, path) {
  const [section, key] = path.split('.');
  return email[section]?.[key] || '';
}

module.exports = function (db, sequelize, DataTypes) {
  const GlobalSettings = sequelize.define(
    'global_setting',
    {
      branding: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        validate: {
          isBranding(value) {
            assertObject(value, 'branding');
            assertKnownStrings(value, BRANDING_KEYS, 'branding');
            if (value.accentColor && !HEX_COLOR.test(value.accentColor)) {
              throw new Error(
                'De accentkleur moet een kleurcode zijn, bijvoorbeeld #00325F'
              );
            }
          },
        },
      },

      email: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        validate: {
          isEmailSettings(value) {
            assertObject(value, 'email');
            for (const [section, sectionValue] of Object.entries(value)) {
              if (!EMAIL_SECTIONS[section]) {
                throw new Error(
                  `email contains an unknown section: ${section}`
                );
              }
              assertObject(sectionValue, `email.${section}`);
              assertKnownStrings(
                sectionValue,
                EMAIL_SECTIONS[section],
                `email.${section}`
              );
            }

            for (const path of REQUIRED_ADDRESSES) {
              if (!addressAt(value, path)) {
                const label = ADDRESS_LABELS[path];
                throw new Error(
                  `${label.charAt(0).toUpperCase()}${label.slice(1)} is verplicht`
                );
              }
            }

            for (const [path, label] of Object.entries(ADDRESS_LABELS)) {
              const address = addressAt(value, path);
              if (address && !Validator.isEmail(address)) {
                throw new Error(`Vul een geldig e-mailadres in voor ${label}`);
              }
            }
          },
        },
      },
    },
    {
      paranoid: false,
    }
  );

  GlobalSettings.auth = GlobalSettings.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return GlobalSettings;
};
