const sanitize = require('../../util/sanitize');

// Helpers for tag creation, extracted so the seqnr-assignment rule
// can be unit tested without a database.

// Mirrors the `type` setter of the Tag model (models/Tag.js), so a lookup
// by type matches the value that will actually be stored. Without this a
// request for ' theme ' or 'thème' would query a type that does not exist
// while the model stores 'theme'.
function normalizeTagType(type) {
  if (!type) return null;
  // A truthy non-string is returned untouched: coercing it with String() would
  // turn junk into a real tag group (['a', 'b'] becomes 'a,b'). Callers reject
  // it with isValidTagType() before this point.
  if (typeof type !== 'string') return type;
  // The setter stores null for any falsy value, so a type that sanitizes down
  // to an empty string must become null here too - otherwise the lookup below
  // would query '' while the row is stored as null.
  return sanitize.safeTags(type.trim()) || null;
}

// A JSON body can carry any type, while the model setter assumes a string and
// calls .trim() on it. Only strings and the falsy values the model stores as
// null are acceptable; anything else is a bad request.
function isValidTagType(type) {
  if (!type) return true;
  return typeof type === 'string';
}

// Same trust boundary as isValidTagType, for the sibling field stored the same
// way: the `name` setter calls sanitize.title(text.trim()), so any non-string
// throws inside the model. The name is required, so a missing one is rejected
// here too; an empty string still falls through to the model's own validation.
function isValidTagName(name) {
  return typeof name === 'string';
}

// A sequence number counts as provided only when it is a finite number, or a
// string that represents one. Everything else (undefined, null, '', '   ',
// booleans, arrays, 'abc', Infinity) means "not provided" and triggers
// automatic bottom placement.
function isSeqnrProvided(seqnr) {
  if (typeof seqnr === 'number') return Number.isFinite(seqnr);
  if (typeof seqnr !== 'string') return false;
  if (seqnr.trim() === '') return false;
  return Number.isFinite(Number(seqnr));
}

// When no seqnr is provided, the new tag should be placed at the
// bottom of its type group: one step past the current highest seqnr
// in that group (or 10 when the group is empty).
function resolveSeqnr(providedSeqnr, maxSeqnrInGroup) {
  if (isSeqnrProvided(providedSeqnr)) {
    return providedSeqnr;
  }

  return (Number.isFinite(maxSeqnrInGroup) ? maxSeqnrInGroup : 0) + 10;
}

module.exports = {
  normalizeTagType,
  isValidTagType,
  isValidTagName,
  isSeqnrProvided,
  resolveSeqnr,
};
