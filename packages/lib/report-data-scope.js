'use strict';

/**
 * Single source of truth for the reporting API data scope (#1647).
 *
 * Consumed by:
 *  - api-server: middleware/api-token-scope-guard.js  (component gate)
 *                middleware/report-field-filter.js     (field filtering)
 *  - admin-server: settings/data-scope.tsx             (admin UI)
 *
 * Each component defines:
 *  - label:          Dutch display label for the admin UI
 *  - pathPattern:    RegExp matching the request path (including the /api prefix)
 *                    that serves this component's raw data
 *  - safeFields:     non-personal fields, always exposed once the component is enabled
 *  - personalFields: fields that may contain personal data. Excluded by default and
 *                    opt-in per field. Dot-paths (e.g. 'user.email') target one level
 *                    of nesting. Each carries a Dutch label for the warning UI.
 *
 * Secure default: a project with no dataScope config exposes nothing raw — a reporting
 * token then only reaches the aggregated /stats endpoints.
 */

const COMPONENTS = {
  plans: {
    label: 'Plannen',
    pathPattern: /^\/api\/project\/\d+\/resource(?:\/|$)/,
    safeFields: [
      'id',
      'projectId',
      'status',
      'startDate',
      'publishDate',
      'title',
      'budget',
      'score',
      'yes',
      'no',
      'createdAt',
      'updatedAt',
    ],
    personalFields: [
      // Free-text fields: publicly shown, but may contain personal info typed by
      // the submitter, so they are opt-in.
      { key: 'summary', label: 'Samenvatting (vrije tekst)' },
      { key: 'description', label: 'Omschrijving (vrije tekst)' },
      { key: 'userId', label: 'Gebruikers-ID' },
      { key: 'extraData', label: 'Extra formuliervelden' },
      { key: 'location', label: 'Locatie' },
      { key: 'user.name', label: 'Naam' },
      { key: 'user.email', label: 'E-mailadres' },
      { key: 'user.phoneNumber', label: 'Telefoonnummer' },
      { key: 'user.address', label: 'Adres' },
      { key: 'user.city', label: 'Plaats' },
      { key: 'user.postcode', label: 'Postcode' },
    ],
  },

  votes: {
    label: 'Stemmen',
    pathPattern: /^\/api\/project\/\d+\/vote(?:\/|$)/,
    safeFields: [
      'id',
      'resourceId',
      'opinion',
      'confirmed',
      'checked',
      'createdAt',
      'updatedAt',
    ],
    personalFields: [
      { key: 'ip', label: 'IP-adres' },
      { key: 'userId', label: 'Gebruikers-ID' },
      { key: 'user.name', label: 'Naam' },
      { key: 'user.email', label: 'E-mailadres' },
      { key: 'user.phoneNumber', label: 'Telefoonnummer' },
      { key: 'user.address', label: 'Adres' },
      { key: 'user.city', label: 'Plaats' },
      { key: 'user.postcode', label: 'Postcode' },
    ],
  },

  comments: {
    label: 'Reacties',
    pathPattern: /^\/api\/project\/\d+(?:\/resource\/\d+)?\/comment(?:\/|$)/,
    safeFields: [
      'id',
      'parentId',
      'resourceId',
      'sentiment',
      'label',
      'yes',
      'no',
      'createdAt',
      'updatedAt',
    ],
    personalFields: [
      // The comment body is publicly shown, but may contain personal info typed
      // by the author, so it is opt-in.
      { key: 'description', label: 'Reactietekst (vrije tekst)' },
      { key: 'userId', label: 'Gebruikers-ID' },
      { key: 'location', label: 'Locatie' },
      { key: 'user.name', label: 'Naam' },
      { key: 'user.email', label: 'E-mailadres' },
      { key: 'user.phoneNumber', label: 'Telefoonnummer' },
      { key: 'user.address', label: 'Adres' },
      { key: 'user.city', label: 'Plaats' },
      { key: 'user.postcode', label: 'Postcode' },
    ],
  },

  surveys: {
    label: 'Enquêtes',
    pathPattern: /^\/api\/project\/\d+\/submission(?:\/|$)/,
    safeFields: ['id', 'status', 'createdAt', 'updatedAt'],
    personalFields: [
      { key: 'submittedData', label: 'Ingezonden antwoorden' },
      { key: 'userId', label: 'Gebruikers-ID' },
      { key: 'user.name', label: 'Naam' },
      { key: 'user.email', label: 'E-mailadres' },
      { key: 'user.phoneNumber', label: 'Telefoonnummer' },
      { key: 'user.address', label: 'Adres' },
      { key: 'user.city', label: 'Plaats' },
      { key: 'user.postcode', label: 'Postcode' },
    ],
  },

  choiceguides: {
    label: 'Keuzewijzers',
    pathPattern: /^\/api\/project\/\d+\/choicesguide(?:\/|$)/,
    // `result` holds the raw submitted answers (and a hashed IP when enabled),
    // so it is personal/opt-in — not part of the safe preset.
    safeFields: ['id', 'createdAt', 'updatedAt'],
    personalFields: [
      { key: 'result', label: 'Ingezonden antwoorden' },
      { key: 'extraData', label: 'Extra formuliervelden' },
      { key: 'userFingerprint', label: 'Gebruiker-fingerprint' },
      { key: 'userId', label: 'Gebruikers-ID' },
    ],
  },
};

// Display order for the admin UI.
const COMPONENT_KEYS = Object.keys(COMPONENTS);

// Match order: 'comments' must be tested before 'plans' because the comment route
// can be nested under a resource path (/api/project/:id/resource/:id/comment),
// which would otherwise be matched by the plans pattern first.
const MATCH_ORDER = ['comments', 'plans', 'votes', 'surveys', 'choiceguides'];

/**
 * Return the component key whose route matches the given request path, or null.
 * @param {string} path req.path including the /api prefix (no query string)
 * @returns {string|null}
 */
function matchComponent(path) {
  if (typeof path !== 'string') return null;
  for (const key of MATCH_ORDER) {
    if (COMPONENTS[key] && COMPONENTS[key].pathPattern.test(path)) return key;
  }
  return null;
}

/**
 * Build the list of fields that may be exposed for a component, given the project's
 * saved dataScope config for that component ({ enabled, personalFields }).
 * Returns null when the component is not enabled (caller should not expose anything).
 * @param {string} componentKey
 * @param {{enabled?: boolean, personalFields?: string[]}} componentConfig
 * @returns {string[]|null}
 */
function getExposedFields(componentKey, componentConfig) {
  const def = COMPONENTS[componentKey];
  if (!def || !componentConfig || !componentConfig.enabled) return null;
  const optedIn = Array.isArray(componentConfig.personalFields)
    ? componentConfig.personalFields
    : [];
  // Only honour personal fields that exist in the catalog (ignore unknown keys).
  const allowedPersonal = def.personalFields
    .map((field) => field.key)
    .filter((key) => optedIn.includes(key));
  return def.safeFields.concat(allowedPersonal);
}

/**
 * Filter a single plain record down to the allowed fields.
 * Supports one level of dot-path nesting (e.g. 'user.email').
 * @param {object} record
 * @param {string[]} allowedFields
 * @returns {object}
 */
function filterRecord(record, allowedFields) {
  if (!record || typeof record !== 'object') return record;

  const topLevel = new Set();
  const nested = {}; // { user: Set(['email', 'name']) }

  for (const field of allowedFields) {
    const dot = field.indexOf('.');
    if (dot === -1) {
      topLevel.add(field);
    } else {
      const parent = field.slice(0, dot);
      const child = field.slice(dot + 1);
      (nested[parent] = nested[parent] || new Set()).add(child);
    }
  }

  const out = {};
  for (const key of topLevel) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      out[key] = record[key];
    }
  }
  for (const parent of Object.keys(nested)) {
    const sub = record[parent];
    if (sub && typeof sub === 'object') {
      const filteredSub = {};
      for (const child of nested[parent]) {
        if (Object.prototype.hasOwnProperty.call(sub, child)) {
          filteredSub[child] = sub[child];
        }
      }
      out[parent] = filteredSub;
    }
  }
  return out;
}

// Keys under which list endpoints nest their record array (e.g. { records: [...] }
// from pagination, or { data: [...], pagination } from the choiceguide list).
const RECORD_ARRAY_KEYS = ['records', 'data', 'rows'];

/**
 * Filter a JSON payload to the allowed fields. Handles the response shapes the
 * api-server emits on reporting routes:
 *  - a plain array of records;
 *  - a paginated wrapper nesting the records under `records`/`data`/`rows`, with
 *    sibling metadata (e.g. pagination) preserved untouched;
 *  - a single record object (identified by an `id`);
 *  - a pure metadata/aggregate object such as `{ count }`, passed through.
 * Anything else is run through filterRecord, which fails closed (strips unknown
 * fields) rather than leaking an unexpected payload.
 * @param {*} payload
 * @param {string[]} allowedFields
 * @returns {*}
 */
function filterPayload(payload, allowedFields) {
  if (Array.isArray(payload)) {
    return payload.map((record) => filterRecord(record, allowedFields));
  }
  if (payload && typeof payload === 'object') {
    for (const key of RECORD_ARRAY_KEYS) {
      if (Array.isArray(payload[key])) {
        return Object.assign({}, payload, {
          [key]: payload[key].map((record) =>
            filterRecord(record, allowedFields)
          ),
        });
      }
    }
    // A single record is identified by an `id` and filtered field-by-field.
    if (Object.prototype.hasOwnProperty.call(payload, 'id')) {
      return filterRecord(payload, allowedFields);
    }
    // Pure metadata/aggregate objects (only scalar values, e.g. { count: 5 })
    // carry no record data and pass through. Objects with nested structure but
    // no record shape are filtered (fail closed) to avoid leaking.
    const hasNestedValue = Object.values(payload).some(
      (value) => value && typeof value === 'object'
    );
    if (!hasNestedValue) {
      return payload;
    }
    return filterRecord(payload, allowedFields);
  }
  return payload;
}

module.exports = {
  COMPONENTS,
  COMPONENT_KEYS,
  matchComponent,
  getExposedFields,
  filterRecord,
  filterPayload,
};
