// Validation for the `content` column of a notification template. Shared by the
// per project templates and the global ones, which must accept exactly the same
// shape: the admin edits both with the same form.

// Keys the admin's content editor writes. Anything else is rejected so the
// column cannot collect stray data: the routes pass the whole request body
// straight into create/update.
const CONTENT_KEYS = [
  'heading',
  'greeting',
  'intro',
  'buttonLabel',
  'buttonUrl',
  'footer',
];

// Same column, but a flag instead of a text field: show the logo in this mail.
const CONTENT_BOOLEAN_KEYS = ['showLogo'];

// Throws on anything the content editor cannot have produced. NULL and undefined
// pass: they mean the template is managed as raw MJML instead.
function assertContentObject(value) {
  if (value === null || value === undefined) return;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('content must be an object');
  }
  for (const key of Object.keys(value)) {
    if (CONTENT_BOOLEAN_KEYS.includes(key)) {
      if (value[key] !== null && typeof value[key] !== 'boolean') {
        throw new Error(`content.${key} must be a boolean`);
      }
      continue;
    }
    if (!CONTENT_KEYS.includes(key)) {
      throw new Error(`content contains unknown key: ${key}`);
    }
    if (value[key] !== null && typeof value[key] !== 'string') {
      throw new Error(`content.${key} must be a string`);
    }
  }
}

module.exports = {
  CONTENT_KEYS,
  CONTENT_BOOLEAN_KEYS,
  assertContentObject,
};
