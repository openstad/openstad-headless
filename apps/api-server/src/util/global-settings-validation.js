// Validation for the global settings form. No database or express imports, so it can be
// unit tested directly.

// Config keys that belong on the global row; everything else is per project.
const ALLOWED_CONFIG_KEYS = ['styling'];

const REQUIRED_EMAIL_FIELDS = [
  {
    path: ['notifications', 'fromAddress'],
    label: 'Notification sender e-mailaddress',
  },
  {
    path: ['notifications', 'replyTo'],
    label: 'Reply to notifications e-mailaddress',
  },
  {
    path: ['login', 'fromAddress'],
    label: 'Login Sender e-mailaddress',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The sections the required-address check is about. Other sections of emailConfig,
// such as the notification styling, have their own form and must save without them.
const SENDER_SECTIONS = ['notifications', 'login'];

// Only enforce the required addresses when the request actually edits a sender
// section. Without this a styling only save is blocked by fields its form cannot show.
function touchesSenderSections(postedEmailConfig) {
  return SENDER_SECTIONS.some((section) =>
    Object.prototype.hasOwnProperty.call(postedEmailConfig || {}, section)
  );
}

// The form posts one section, e.g. {login: {...}}. Lay it over what is stored so the
// required-field check sees the resulting settings instead of just the posted part.
function mergeEmailConfigSections(storedEmailConfig, postedEmailConfig) {
  const merged = { ...(storedEmailConfig || {}) };
  for (const key of Object.keys(postedEmailConfig || {})) {
    merged[key] = {
      ...merged[key],
      ...postedEmailConfig[key],
    };
  }
  return merged;
}

function validateEmailConfig(emailConfig) {
  const errors = [];
  for (const field of REQUIRED_EMAIL_FIELDS) {
    const value = field.path.reduce(
      (obj, key) => (obj ? obj[key] : undefined),
      emailConfig
    );
    if (!value || !String(value).trim()) {
      errors.push(`${field.label} is required`);
    } else if (!EMAIL_REGEX.test(String(value).trim())) {
      errors.push(`${field.label} must be a valid e-mail address`);
    }
  }
  return errors;
}

// Returns the storable part plus an error per rejected key, so adding a branding field
// without extending ALLOWED_CONFIG_KEYS fails loudly instead of dropping the value.
function pickAllowedConfig(config) {
  const allowed = {};
  const errors = [];
  for (const key of Object.keys(config || {})) {
    if (ALLOWED_CONFIG_KEYS.includes(key)) {
      allowed[key] = config[key];
    } else {
      errors.push(
        `Config key "${key}" cannot be stored in the global settings`
      );
    }
  }
  return { allowed, errors };
}

module.exports = {
  ALLOWED_CONFIG_KEYS,
  REQUIRED_EMAIL_FIELDS,
  EMAIL_REGEX,
  SENDER_SECTIONS,
  mergeEmailConfigSections,
  touchesSenderSections,
  validateEmailConfig,
  pickAllowedConfig,
};
