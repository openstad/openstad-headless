const TAG_ID_LIST_KEYS = new Set([
  'onlyIncludeTagIds',
  'onlyShowTheseTagIds',
  'onlyIncludeOrExcludeTagIds',
  'defaultTags',
  'defaultAddedTags',
  'linkTags',
  'tagIds',
  'ownResourceTags',
]);

const STATUS_ID_LIST_KEYS = new Set(['onlyIncludeStatusIds', 'statusId']);

const WIDGET_ID_KEYS = new Set([
  'widgetId',
  'choiceguideWidgetId',
  'widgetToFetchId',
]);

const RESOURCE_ID_KEYS = new Set(['resourceId']);

const PROJECT_ID_KEYS = new Set(['projectId']);

const MARKER_SET_LIST_KEYS = new Set(['markerSets']);

const NON_REFERENCE_ID_KEYS = new Set([
  'includeOrExcludeTagIds',
  'includeOrExcludeStatusIds',
  'areaId',
]);

const GLOBAL_PROJECT_IDS = new Set([0, '0']);

const ID_KEY_PATTERN = /[a-z0-9](Id|Ids)$/;

function isIdKey(key) {
  return ID_KEY_PATTERN.test(key);
}

function isClassifiedIdKey(key) {
  return (
    TAG_ID_LIST_KEYS.has(key) ||
    STATUS_ID_LIST_KEYS.has(key) ||
    WIDGET_ID_KEYS.has(key) ||
    RESOURCE_ID_KEYS.has(key) ||
    PROJECT_ID_KEYS.has(key) ||
    NON_REFERENCE_ID_KEYS.has(key)
  );
}

function idsFromValue(value) {
  if (Array.isArray(value)) {
    return value.map((id) => String(id).trim()).filter(Boolean);
  }
  if (typeof value === 'number') return [String(value)];
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return [];
}

function isEmptyValue(value) {
  return value === null || value === undefined || value === '';
}

function remapIdList(value, idMap) {
  const ids = idsFromValue(value);
  const mapped = ids.map((id) => idMap[id]).filter((id) => id !== undefined);
  const lostIds = mapped.length !== ids.length;

  if (Array.isArray(value)) {
    const asNumbers = value.every((id) => typeof id === 'number');
    return {
      value: mapped.map((id) => (asNumbers ? Number(id) : String(id))),
      lostIds,
    };
  }
  if (typeof value === 'number') {
    return { value: mapped.length ? Number(mapped[0]) : null, lostIds };
  }
  return { value: mapped.join(','), lostIds };
}

function remapSingleId(value, idMap) {
  const mapped = idMap[String(value).trim()];
  if (mapped === undefined) return { value: null, lost: true };
  return {
    value: typeof value === 'string' ? String(mapped) : Number(mapped),
    lost: false,
  };
}

function remapConfig(
  config,
  { tagMap, statusMap, markerSetMap, widgetMap, targetProjectId }
) {
  const clearedKeys = [];

  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return;

    for (const key of Object.keys(node)) {
      const value = node[key];
      const keyPath = path ? `${path}.${key}` : key;

      if (MARKER_SET_LIST_KEYS.has(key)) {
        if (!Array.isArray(value)) continue;
        const kept = value
          .filter((entry) => entry && markerSetMap[String(entry.id)])
          .map((entry) => ({
            ...entry,
            id: Number(markerSetMap[String(entry.id)]),
          }));
        if (kept.length !== value.length) clearedKeys.push(keyPath);
        node[key] = kept;
        continue;
      }

      const isReferenceKey =
        isIdKey(key) ||
        TAG_ID_LIST_KEYS.has(key) ||
        STATUS_ID_LIST_KEYS.has(key) ||
        WIDGET_ID_KEYS.has(key);

      if (!isReferenceKey) {
        walk(value, keyPath);
        continue;
      }

      if (NON_REFERENCE_ID_KEYS.has(key) || isEmptyValue(value)) continue;

      if (PROJECT_ID_KEYS.has(key)) {
        if (!GLOBAL_PROJECT_IDS.has(value)) {
          node[key] =
            typeof value === 'string'
              ? String(targetProjectId)
              : targetProjectId;
        }
      } else if (TAG_ID_LIST_KEYS.has(key)) {
        const { value: mapped, lostIds } = remapIdList(value, tagMap);
        node[key] = mapped;
        if (lostIds) clearedKeys.push(keyPath);
      } else if (STATUS_ID_LIST_KEYS.has(key)) {
        const { value: mapped, lostIds } = remapIdList(value, statusMap);
        node[key] = mapped;
        if (lostIds) clearedKeys.push(keyPath);
      } else if (WIDGET_ID_KEYS.has(key)) {
        const { value: mapped, lost } = remapSingleId(value, widgetMap);
        node[key] = mapped;
        if (lost) clearedKeys.push(keyPath);
      } else {
        node[key] = null;
        clearedKeys.push(keyPath);
      }
    }
  };

  walk(config, '');

  return { clearedKeys };
}

module.exports = {
  remapConfig,
  isIdKey,
  isClassifiedIdKey,
};
