/**
 * Replace {{key}} tokens in a string with values from a vars object.
 * Unknown tokens are left as-is. Returns false for falsy input.
 *
 * @param {string} text
 * @param {Record<string, string>} vars
 * @returns {string|false}
 */
const interpolate = (text, vars) => {
  if (!text) return false;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
};

module.exports = interpolate;
