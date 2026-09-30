// Pure source-to-target row matching for a cross-project widget copy.
// Kept free of `db` so the matching rules can be unit tested without one.

// A tag's identity is its type plus its name. Two tags can share a name across
// types -- an 'area' tag and a 'theme' tag both named "Centrum" -- so matching
// on the name alone would map a source tag onto a target tag of another type.
//
// The separator is an escaped NUL, not a space: a tag type is free text, so with
// a space the pairs ('a', 'b c') and ('a b', 'c') would share one identity, and a
// wrong mapping is worse than none.
const tagIdentity = (tag) => `${tag.type ?? ''}\u0000${tag.name ?? ''}`;

// Statuses have no type column, so the name is all there is to match on.
const statusIdentity = (status) => `${status.name ?? ''}`;

// Marker sets have no type either; a map widget stores their name alongside the
// id, which is what makes matching them possible at all.
const markerSetIdentity = (markerSet) => `${markerSet.name ?? ''}`;

// Indexes target rows by identity so a source row can find its equivalent. An
// identity shared by more than one target row is ambiguous -- there is no way to
// tell which one was meant -- so it is excluded, which makes the reference get
// cleared instead of pointing at an arbitrary row.
function indexByIdentity(rows, identityOf) {
  const idByIdentity = new Map();
  const ambiguous = new Set();

  rows.forEach((row) => {
    const identity = identityOf(row);
    if (idByIdentity.has(identity)) {
      ambiguous.add(identity);
      return;
    }
    idByIdentity.set(identity, row.id);
  });

  ambiguous.forEach((identity) => idByIdentity.delete(identity));

  return idByIdentity;
}

// Maps source row ids to the target project's equivalent ids. Rows without a
// match, and rows whose identity is ambiguous in the target, are left out.
function buildIdMap(sourceRows, targetRows, identityOf) {
  const targetIdByIdentity = indexByIdentity(targetRows, identityOf);

  const idMap = {};
  sourceRows.forEach((row) => {
    const targetId = targetIdByIdentity.get(identityOf(row));
    if (targetId) idMap[row.id] = targetId;
  });
  return idMap;
}

module.exports = {
  tagIdentity,
  statusIdentity,
  markerSetIdentity,
  indexByIdentity,
  buildIdMap,
};
