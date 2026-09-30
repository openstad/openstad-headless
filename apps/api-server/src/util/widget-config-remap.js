// Pure widget-config reference remapping for copying a widget into ANOTHER
// project. Deliberately free of `db`, `req` and `res` so the rules below can be
// unit tested without a database.
//
// The guiding rule: a config value that identifies a row owned by the source
// project is either rewritten to the target project's equivalent or cleared. It
// is never left pointing at the source project. Because widget config has no
// server-side schema, the rule is applied to *every* key that looks like an id
// (see ID_KEY_PATTERN) instead of only to the keys we happen to know about --
// otherwise a widget that gains a new id field later would silently carry the
// source project's ids into the copy.

// Config keys holding a comma-separated list of tag ids.
//
// Not every one of these ends in `Ids`: `defaultAddedTags` (resource-form) holds
// tag ids too, and would otherwise be missed by ID_KEY_PATTERN entirely and copied
// across as the source project's ids.
const TAG_ID_KEYS = new Set([
  'onlyIncludeTagIds',
  'onlyIncludeOrExcludeTagIds',
  'onlyShowTheseTagIds',
  'defaultAddedTags',
]);

// Config keys holding one status id, or a comma-separated list of them.
const STATUS_ID_KEYS = new Set([
  'onlyIncludeStatusIds',
  // The document-map links a single status; see packages/document-map.
  'statusId',
]);

// Config keys holding a widget id. `widgetId` is the widget's OWN id -- the
// widget route uses it to build the component id -- so remapping it through
// widgetMap is also what gives a copy its own new id instead of the source's.
const WIDGET_ID_KEYS = new Set([
  'widgetId',
  'choiceguideWidgetId',
  'widgetToFetchId',
]);

// Config keys holding a single resource id.
const RESOURCE_ID_KEYS = new Set(['resourceId']);

// Config keys holding the project id itself.
const PROJECT_ID_KEYS = new Set(['projectId']);

// Keys that end in Id/Ids but do NOT reference a row owned by a project, so
// they survive the copy untouched. Every other id-shaped key that is not
// remapped above is cleared.
const NON_PROJECT_SCOPED_ID_KEYS = new Set([
  // Hold the string 'include' or 'exclude', not an id, despite the name.
  'includeOrExcludeTagIds',
  'includeOrExcludeStatusIds',
  // An Area is a global row -- the Area model has no projectId -- so its id is
  // valid in the target project as it is.
  'areaId',
]);

// The tag pickers offer global tags alongside the project's own, and a tag group
// records `projectId: '0'` to mean "read the global tag list". That marker is not
// a reference to the source project, so it must survive the copy: the widget only
// switches to the global list when the value is the string '0'. See
// packages/ui/src/stem-begroot-and-resource-overview/filter/.
const GLOBAL_PROJECT_ID_MARKERS = new Set([0, '0']);

// Config keys holding an array of `{ id, name }` entries that reference rows
// owned by the project. A bare `id` is not id-shaped and must not be treated as
// such: a multi-project overview stores `selectedProjects[].id`, which points at
// other projects on purpose and has to survive the copy untouched. So these
// containers are named explicitly and matched on the name they already carry.
const NAMED_REFERENCE_LIST_KEYS = new Set(['markerSets']);

// A camelCase key ending in `Id` or `Ids`. Anchored on a preceding lowercase
// letter or digit so words that merely end in "id" (valid, grid, hybrid) do not
// match.
const ID_KEY_PATTERN = /[a-z0-9](Id|Ids)$/;

function isIdKey(key) {
  return (
    ID_KEY_PATTERN.test(key) ||
    PROJECT_ID_KEYS.has(key) ||
    RESOURCE_ID_KEYS.has(key) ||
    WIDGET_ID_KEYS.has(key) ||
    TAG_ID_KEYS.has(key) ||
    STATUS_ID_KEYS.has(key)
  );
}

// Every id-shaped config key the copy knows how to handle. Used by the guard
// test that trips when a widget gains an id field nobody classified.
function isClassifiedIdKey(key) {
  return (
    PROJECT_ID_KEYS.has(key) ||
    RESOURCE_ID_KEYS.has(key) ||
    WIDGET_ID_KEYS.has(key) ||
    TAG_ID_KEYS.has(key) ||
    STATUS_ID_KEYS.has(key) ||
    NON_PROJECT_SCOPED_ID_KEYS.has(key)
  );
}

// Remaps one comma-separated id list against idMap. Ids without an entry are
// dropped; null is returned when nothing survived, so the caller can clear the
// whole key.
function remapIdList(value, idMap) {
  const raw = typeof value === 'number' ? value.toString() : value;

  // Fail closed. An id list is a scalar by contract, but config is stored
  // without a server-side schema, so this can hold anything. An unrecognised
  // shape cannot be remapped, and passing it through would carry the source
  // project's ids into the target.
  if (typeof raw !== 'string') return null;
  if (raw === '') return value;

  const mapped = raw
    .split(',')
    .map((id) => idMap[id] || '')
    .filter((id) => id !== '')
    .join(',');

  return mapped === '' ? null : mapped;
}

// Remaps an array of `{ id, name }` references. Entries whose id has no
// equivalent in the target project are dropped rather than kept pointing at the
// source project's row. Returns null for an unrecognised shape, same as
// remapIdList, so nothing untranslatable survives.
function remapNamedReferenceList(value, idMap) {
  if (!Array.isArray(value)) return { value: value == null ? value : null };

  const kept = value
    .filter((entry) => entry && idMap[entry.id] !== undefined)
    .map((entry) => ({ ...entry, id: idMap[entry.id] }));

  return { value: kept, dropped: kept.length !== value.length };
}

// Rewrites the project-scoped references in `config` in place for the target
// project. Returns the id-shaped keys that were cleared because they had no
// equivalent in the target project, so the caller can log them.
function remapWidgetConfigForProject(
  config,
  {
    widgetMap = {},
    resourceMap = {},
    tagMap = {},
    statusMap = {},
    markerSetMap = {},
    projectId,
  }
) {
  const clearedKeys = [];

  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return;

    for (const key in node) {
      const keyPath = path ? `${path}.${key}` : key;

      if (NAMED_REFERENCE_LIST_KEYS.has(key)) {
        const { value, dropped } = remapNamedReferenceList(
          node[key],
          markerSetMap
        );
        node[key] = value;
        if (dropped) clearedKeys.push(keyPath);
        continue;
      }

      // An id-shaped key is never recursed into. Walking one would treat its
      // entries as config keys and leave the source project's ids in place.
      if (!isIdKey(key)) {
        walk(node[key], keyPath);
        continue;
      }

      if (PROJECT_ID_KEYS.has(key)) {
        if (!GLOBAL_PROJECT_ID_MARKERS.has(node[key])) {
          // Keep the stored type. A tag group holds its projectId as a string
          // and is compared with `typeof value === 'string'`, so handing it a
          // number would break the comparison as surely as a wrong id would.
          node[key] =
            typeof node[key] === 'string' ? String(projectId) : projectId;
        }
      } else if (NON_PROJECT_SCOPED_ID_KEYS.has(key)) {
        // Not a project-scoped reference: leave it alone.
      } else if (RESOURCE_ID_KEYS.has(key)) {
        // null rather than undefined: an undefined value is dropped by
        // JSON.stringify, which silently hands the key back to the widget
        // registry default instead of storing "no resource selected".
        node[key] = resourceMap[node[key]] ?? null;
        if (node[key] === null) clearedKeys.push(keyPath);
      } else if (WIDGET_ID_KEYS.has(key)) {
        node[key] = widgetMap[node[key]] ?? null;
        if (node[key] === null) clearedKeys.push(keyPath);
      } else if (TAG_ID_KEYS.has(key)) {
        node[key] = remapIdList(node[key], tagMap);
        if (node[key] === null) clearedKeys.push(keyPath);
      } else if (STATUS_ID_KEYS.has(key)) {
        node[key] = remapIdList(node[key], statusMap);
        if (node[key] === null) clearedKeys.push(keyPath);
      } else {
        // An id-shaped key nobody classified. It may well point at a row in the
        // source project, and there is no rule to translate it, so clear it
        // rather than hand the target project a foreign id.
        if (node[key] !== null && node[key] !== '') clearedKeys.push(keyPath);
        node[key] = null;
      }
    }
  };

  walk(config, '');

  return { clearedKeys };
}

module.exports = {
  remapWidgetConfigForProject,
  isIdKey,
  isClassifiedIdKey,
  TAG_ID_KEYS,
  STATUS_ID_KEYS,
  WIDGET_ID_KEYS,
  RESOURCE_ID_KEYS,
  PROJECT_ID_KEYS,
  NON_PROJECT_SCOPED_ID_KEYS,
};
