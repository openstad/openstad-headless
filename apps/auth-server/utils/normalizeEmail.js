/**
 * One canonical form for e-mail addresses: trimmed and lower-cased.
 *
 * Phones capitalise the first letter and add a space after autocomplete, and
 * copy-paste brings leading spaces. Without normalising, the same person can
 * exist twice ("Tosh@..." next to "tosh@...") and a login with a leading space
 * fails even though the address is right. Passwords are never touched.
 */
function normalizeEmail(value) {
  if (typeof value !== 'string') return value;
  return value.trim().toLowerCase();
}

module.exports = normalizeEmail;
